import {config,identifiers,normalizePack} from './core';
import {adapter} from './genlayer';
import {AppError,type AssessmentResult,type Lookup} from './types';
import {RecoveryStore,validateRecovered,type RecoveryRecord} from './recovery';
import {classifyReadError,visible,type ReadIssue} from './read-scheduler';
import {type LifecycleState} from './lifecycle';
import {FlowError,rejected,WalletSession} from './wallet';
import {createWriteAdapter,receiptReader,verifyTransactionBinding,type TxOutcome} from './transactions';
export interface Draft {client_key:string;claim:string;context:string;urls:string[]}
export interface Prepared extends Draft {creator:string;request_id:string;payload_digest:string;contract:string}
export interface FlowState {state:LifecycleState;tx?:string;prepared?:Prepared;error?:FlowError;receipt?:TxOutcome;assessment?:AssessmentResult;readIssue?:ReadIssue}
interface Reads {getProtocolInfo():Promise<unknown>;lookupRequest(creator:string,key:string):Promise<Lookup>;getAssessment(id:string):Promise<AssessmentResult>}
interface Writes {assess(key:string,claim:string,context:string,urls:string[]):Promise<string>;getTransaction(hash:`0x${string}`):Promise<TxOutcome>}
interface Reliability {store?:RecoveryStore;receipt?:typeof receiptReader;foreground?:()=>Promise<void>;now?:()=>number;blocked?:boolean}
export function newClientKey(){return 'echo-'+crypto.randomUUID().replaceAll('-','')}
export class WriteController {
 snapshot:FlowState={state:'idle'};private busy=false;private sent=false;private cancelled=false;private terminal=false;private finalConfirmed=false;private submittedAt=0;
 constructor(readonly wallet:WalletSession,private changed:(s:FlowState)=>void,private reads:Reads=adapter,private makeWrite=(p:Parameters<typeof createWriteAdapter>[0],a:`0x${string}`,g:()=>Promise<void>):Writes=>createWriteAdapter(p,a,g),private wait=(ms=5000)=>new Promise<void>(r=>setTimeout(r,ms)),private navigate=(id:string)=>{window.location.hash='/report/'+id},private reliability:Reliability={}){}
 private set(x:Partial<FlowState>){this.snapshot={...this.snapshot,...x};this.persist();this.changed(this.snapshot)}
 private persist(){const s=this.snapshot,p=s.prepared;if(!p)return;const draft={client_key:p.client_key,claim:p.claim,context:p.context,urls:p.urls};if(!this.sent&&s.state!=='awaiting_signature'){this.reliability.store?.save(draft);return}
  const phase:NonNullable<RecoveryRecord['active']>['phase']=s.state.startsWith('finalized_')&&s.assessment?.found?'completed':this.terminal?'terminal_failed':s.state==='finalized_reading'?'finalized_reading':s.tx?'tracking':'submission_unknown';
  this.reliability.store?.save(draft,{prepared:p,tx:s.tx,submittedAt:this.submittedAt||(this.submittedAt=(this.reliability.now??Date.now)()),lastState:s.state,phase,...(this.wallet.choice?{wallet:{id:this.wallet.choice.id,name:this.wallet.choice.name}}:{})});
 }
 newAssessment(){if(!this.canStartNew)throw Error('Unresolved submission: resume reads; do not start another write');this.sent=false;this.terminal=false;this.finalConfirmed=false;this.submittedAt=0;this.cancelled=false;this.snapshot={state:'idle'};this.changed(this.snapshot);return newClientKey()}
 stop(){this.cancelled=true}
 async submit(draft:Draft){if(this.busy||this.sent||this.reliability.blocked)return;this.busy=true;this.cancelled=false;this.set({error:undefined,readIssue:undefined});let phase='read';try{
  const choice=this.wallet.choice,creator=this.wallet.account;if(!choice||!creator)throw new FlowError('WRONG_NETWORK','Connect the selected wallet first');
  this.set({state:'switching_network'});await this.wallet.ensureNetwork();const revision=this.wallet.revision;const guard=()=>this.wallet.assertBinding(choice,creator,revision);await guard();
  const payload=normalizePack(draft.claim,draft.context,draft.urls);const ids=await identifiers(creator,draft.client_key,payload);const prepared={...payload,...ids,client_key:draft.client_key,creator,contract:config.contract};Object.freeze(prepared.urls);Object.freeze(prepared);this.set({prepared});
  await this.reads.getProtocolInfo();const found=await this.reads.lookupRequest(creator,draft.client_key);await guard();
  if(found.found){if(found.payload_digest!==ids.payload_digest)throw new FlowError('IDEMPOTENCY_CONFLICT','This client key already has a different payload');this.sent=true;this.set({state:'finalized_reading'});for(let n=0;n<6;n++){if(await this.readFinal(prepared))return;await this.wait(this.delay(n))}this.set({readIssue:'FINALIZED_READ_LAG'});throw new FlowError('RPC_READ_FAILED','Existing record could not be read; no write sent')}
  phase='signature';this.set({state:'awaiting_signature'});const writer=this.makeWrite(choice.provider,creator as `0x${string}`,guard);await guard();const tx=await writer.assess(draft.client_key,payload.claim,payload.context,payload.urls);this.sent=true;
  if(!/^0x[0-9a-f]{64}$/i.test(tx))throw new FlowError('TRANSACTION_SUBMISSION_FAILED','SDK did not expose a valid GenLayer transaction ID');this.set({state:'submitted',tx});phase='tracking';await this.track(writer,prepared,tx as `0x${string}`);
 }catch(e){const detail=e instanceof Error?e.message:typeof e==='object'&&e&&'message' in e?String(e.message):String(e);const error=e instanceof FlowError?e:e instanceof AppError?new FlowError(e.kind==='CONFIGURATION_MISMATCH'?'PROTOCOL_MISMATCH':'RPC_READ_FAILED',e.message,e):new FlowError(rejected(e)?'USER_REJECTED_SIGNATURE':phase==='signature'&&/insufficient funds/i.test(detail)?'INSUFFICIENT_TEST_GEN':phase==='signature'?'TRANSACTION_SUBMISSION_FAILED':'RPC_READ_FAILED',detail,e);if(phase==='signature'&&!rejected(e)&&!(e instanceof FlowError&&['WRONG_NETWORK','ACCOUNT_CHANGED_BEFORE_SEND'].includes(e.code)))this.sent=true;this.set({state:rejected(e)?'rejected_by_user':(phase==='tracking'||this.sent||['RPC_READ_FAILED','PROTOCOL_MISMATCH'].includes(error.code))&&!['TRANSACTION_EXECUTION_FAILED','REQUEST_ID_MISMATCH'].includes(error.code)?'tracking_unavailable':'execution_failed',error,readIssue:this.snapshot.readIssue??(this.sent&&!this.snapshot.tx?'SUBMISSION_UNKNOWN':error.code==='PROTOCOL_MISMATCH'?'PROTOCOL_MISMATCH':phase==='tracking'||error.code==='RPC_READ_FAILED'?classifyReadError(e).issue:undefined)})}finally{this.busy=false}}
 private async readFinal(p:Prepared){const result=await this.reads.getAssessment(p.request_id);if(!result.found)return false;const a=result.assessment;if(a.request_id!==p.request_id)throw new FlowError('REQUEST_ID_MISMATCH','Final record has different request ID');if(a.creator!==p.creator||a.payload_digest!==p.payload_digest||a.protocol_version!==config.protocolVersion||a.client_key!==p.client_key||a.claim!==p.claim||a.context!==p.context||JSON.stringify(a.urls)!==JSON.stringify(p.urls))throw new FlowError('REQUEST_ID_MISMATCH','Final record does not match prepared input');this.set({assessment:result,state:a.result_status==='COMPLETE'?'finalized_complete':'finalized_partial',error:undefined,readIssue:undefined});this.navigate(p.request_id);return true}
 private delay(checks:number){return checks<12?5000:checks<36?10000:15000}
 private async track(writer:Writes,p:Prepared,tx:`0x${string}`){for(let checks=0;checks<120&&!this.cancelled;checks++){
  await (this.reliability.foreground??visible)();if(this.cancelled)return;const receipt=await writer.getTransaction(tx);if(this.cancelled)return;this.set({receipt,error:undefined,readIssue:undefined});if(receipt.status==='FINALIZED'){verifyTransactionBinding(receipt.raw,tx,p);
   if(receipt.consensus!=='MAJORITY_AGREE'||receipt.execution!=='SUCCESS'){this.terminal=true;throw new FlowError('TRANSACTION_EXECUTION_FAILED','Finalized execution or consensus failed')};
   if(!receipt.returns?.length||receipt.returns.some(x=>x.request_id!==p.request_id))throw new FlowError('REQUEST_ID_MISMATCH','Execution return does not match expected request ID');
   this.finalConfirmed=true;await this.readAfterFinal(p);return;
  }
  if(['CANCELED','UNDETERMINED'].includes(receipt.status)){this.terminal=true;throw new FlowError('TRANSACTION_EXECUTION_FAILED','Network terminal status: '+receipt.status)}
  this.set({state:receipt.status==='ACCEPTED'?'accepted_waiting_finality':'pending'});await this.wait(this.delay(checks));
 }if(!this.cancelled)this.set({state:'tracking_unavailable',readIssue:'TRACKING_UNAVAILABLE'})}
 private recovered(p:Prepared){return validateRecovered(p).catch(e=>{throw new FlowError('REQUEST_ID_MISMATCH','Saved recovery input/hash mismatch',e)})}
 async recover(active:NonNullable<RecoveryRecord['active']>){if(this.busy)return;this.busy=true;this.sent=true;this.cancelled=false;this.submittedAt=active.submittedAt;this.set({state:'tracking_unavailable',prepared:active.prepared,tx:active.tx});
  try{const p=await this.recovered(active.prepared);if(this.cancelled)return;this.set({prepared:p});
   if(active.tx)await this.trackReadOnly(p,active.tx as `0x${string}`);else await this.recoverUnknown(p);
  }catch(e){this.recoveryError(e)}finally{this.busy=false}}
 private async recoverUnknown(p:Prepared){this.set({state:'tracking_unavailable',readIssue:'SUBMISSION_UNKNOWN'});await (this.reliability.foreground??visible)();if(this.cancelled)return;const found=await this.reads.lookupRequest(p.creator,p.client_key);if(this.cancelled)return;
  if(!found.found)return;if(found.request_id!==p.request_id||found.payload_digest!==p.payload_digest)throw new FlowError('IDEMPOTENCY_CONFLICT','Stored request payload mismatch');
  this.set({state:'finalized_reading',readIssue:undefined});for(let n=0;n<6&&!this.cancelled;n++){await (this.reliability.foreground??visible)();if(this.cancelled)return;if(await this.readFinal(p))return;await this.wait(this.delay(n))}if(!this.cancelled)this.set({state:'tracking_unavailable',readIssue:'FINALIZED_READ_LAG'});
 }
 private async readAfterFinal(p:Prepared){this.set({state:'finalized_reading',error:undefined,readIssue:undefined});for(let n=0;n<6&&!this.cancelled;n++){await (this.reliability.foreground??visible)();if(this.cancelled)return;if(await this.readFinal(p))return;await this.wait(this.delay(n))}if(!this.cancelled)this.set({state:'tracking_unavailable',readIssue:'FINALIZED_READ_LAG',error:new FlowError('RPC_READ_FAILED','Finalized record not available yet; no write resent')})}
 private trackReadOnly(p:Prepared,tx:`0x${string}`){if(this.finalConfirmed)return this.readAfterFinal(p);return this.track({assess:async()=>{throw Error('Recovery cannot write')},getTransaction:(this.reliability.receipt??receiptReader).getTransaction},p,tx)}
 private recoveryError(e:unknown){const error=e instanceof FlowError?e:new FlowError(e instanceof AppError&&e.kind==='CONFIGURATION_MISMATCH'?'PROTOCOL_MISMATCH':'RPC_READ_FAILED',e instanceof Error?e.message:String(e),e);this.set({state:this.terminal?'execution_failed':'tracking_unavailable',error,readIssue:this.terminal||error.code==='REQUEST_ID_MISMATCH'?undefined:classifyReadError(e).issue})}
 async resume(){if(this.busy||!this.snapshot.prepared)return;this.busy=true;this.cancelled=false;try{const p=await this.recovered(this.snapshot.prepared);if(this.snapshot.tx)await this.trackReadOnly(p,this.snapshot.tx as `0x${string}`);else if(this.sent)await this.recoverUnknown(p);else {await this.reads.getProtocolInfo();const found=await this.reads.lookupRequest(p.creator,p.client_key);if(found.found)await this.recoverUnknown(p);else this.set({state:'idle',error:undefined,readIssue:undefined})}}catch(e){this.recoveryError(e)}finally{this.busy=false}}
 get active(){return this.busy}
 get locked(){return this.busy||this.sent||Boolean(this.reliability.blocked)}
 get canStartNew(){return !this.busy&&!this.reliability.blocked&&(!this.sent||this.terminal||['finalized_complete','finalized_partial'].includes(this.snapshot.state))}
}

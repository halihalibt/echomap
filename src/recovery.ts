import {config,identifiers,normalizePack,normalizeText,codepoints} from './core';
import {lifecycleStates,type LifecycleState} from './lifecycle';
import type {Draft,Prepared} from './controller';
export interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void}
export interface RecoveryRecord {version:1;network:string;chainId:number;contract:string;draft:Draft;active?:{prepared:Prepared;wallet?:{id:string;name:string};tx?:string;submittedAt:number;lastState:LifecycleState;phase:'submission_unknown'|'tracking'|'finalized_reading'|'completed'|'terminal_failed'}}
export const recoveryKey='echomap-recovery-v1';
export function browserStorage():StorageLike|undefined{try{return typeof window!=='undefined'?window.localStorage:undefined}catch{return undefined}}
export class RecoveryStore {
 available=true;problem?:string;
 constructor(private storage:StorageLike|undefined){if(!storage){this.available=false;this.problem='STORAGE_UNAVAILABLE'}}
 load():RecoveryRecord|undefined{if(!this.storage)return;let raw:string|null;try{raw=this.storage.getItem(recoveryKey)}catch{this.available=false;this.problem='STORAGE_UNAVAILABLE';return}try{if(!raw)return;if(raw.length>40000)throw Error('Oversize recovery state');const x=JSON.parse(raw) as RecoveryRecord;
  if(x.version!==1||x.network!==config.network||x.chainId!==config.chainId||x.contract!==config.contract||!x.draft||!/^[A-Za-z0-9_-]{1,64}$/.test(x.draft.client_key)||typeof x.draft.claim!=='string'||typeof x.draft.context!=='string'||!Array.isArray(x.draft.urls)||x.draft.urls.length<2||x.draft.urls.length>4||x.draft.urls.some(u=>typeof u!=='string'))throw Error('Invalid saved draft');
  if(x.active){const a=x.active,p=a.prepared;if(!p||p.contract!==config.contract||!/^0x[0-9a-f]{40}$/.test(p.creator)||!lifecycleStates.includes(a.lastState)||!['submission_unknown','tracking','finalized_reading','completed','terminal_failed'].includes(a.phase)||!Number.isFinite(a.submittedAt)||(a.tx!==undefined&&!/^0x[0-9a-f]{64}$/i.test(a.tx)))throw Error('Invalid recovery identity');validateStoredInput(p);if(x.draft.client_key!==p.client_key||x.draft.claim!==p.claim||x.draft.context!==p.context||JSON.stringify(x.draft.urls)!==JSON.stringify(p.urls))throw Error('Saved draft does not match active request');if(!/^[A-Za-z0-9_-]{1,64}$/.test(p.client_key)||!/^[0-9a-f]{64}$/.test(p.request_id)||!/^[0-9a-f]{64}$/.test(p.payload_digest))throw Error('Invalid saved request')}
  return x;
 }catch{this.problem='INVALID_RECOVERY_STATE';return}}
 save(draft:Draft,active?:RecoveryRecord['active']){if(!this.storage||this.problem==='INVALID_RECOVERY_STATE')return;try{const clean={client_key:draft.client_key,claim:draft.claim,context:draft.context,urls:[...draft.urls]};const value:RecoveryRecord={version:1,network:config.network,chainId:config.chainId,contract:config.contract,draft:clean};if(active){const p=active.prepared;value.active={phase:active.phase,lastState:active.lastState,submittedAt:active.submittedAt,tx:active.tx,prepared:{client_key:p.client_key,claim:p.claim,context:p.context,urls:[...p.urls],creator:p.creator,request_id:p.request_id,payload_digest:p.payload_digest,contract:p.contract},...(active.wallet?{wallet:{id:active.wallet.id,name:active.wallet.name}}:{})}}this.storage.setItem(recoveryKey,JSON.stringify(value));this.available=true;if(this.problem==='STORAGE_UNAVAILABLE')this.problem=undefined}catch{this.available=false;this.problem='STORAGE_UNAVAILABLE'}}
}
function validateStoredInput(p:Prepared){
 const urls=normalizePack('x','',p.urls).urls;
 // Same stored-text invariant as core.verifyAssessment: do not normalize a second time.
 if(typeof p.claim!=='string'||typeof p.context!=='string'||!p.claim||codepoints(p.claim)>config.limits.claim||codepoints(p.context)>config.limits.context||normalizeText('\uFEFF'+p.claim)!==p.claim||normalizeText('\uFEFF'+p.context)!==p.context||JSON.stringify(urls)!==JSON.stringify(p.urls))throw Error('Noncanonical saved input');
}
export async function validateRecovered(p:Prepared){validateStoredInput(p);const ids=await identifiers(p.creator,p.client_key,p);if(p.contract!==config.contract||ids.request_id!==p.request_id||ids.payload_digest!==p.payload_digest)throw Error('Recovery input/hash mismatch');return Object.freeze({...p,urls:Object.freeze([...p.urls]) as unknown as string[]})}

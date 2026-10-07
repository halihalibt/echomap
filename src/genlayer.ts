import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import {config,hex64,identifiers,protocolGuard,verifyAssessment} from './core';
import {classifyReadError} from './read-scheduler';
import {AppError,type AssessmentResult,type Lookup,type ProtocolInfo} from './types';
export interface ReadClient {readContract(options:{address:`0x${string}`;functionName:string;args:string[];transactionHashVariant:TransactionHashVariant}):Promise<unknown>}
export function createReadAdapter(client:ReadClient){
 let protocol:Promise<ProtocolInfo>|undefined;
 async function read(functionName:string,args:string[]){try{return await client.readContract({address:config.contract as `0x${string}`,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL})}catch(e){const error=new AppError('TRANSPORT_ERROR',e instanceof Error?e.message:'RPC read failed');Object.assign(error,{readIssue:classifyReadError(e).issue,cause:e});throw error}}
 const getProtocolInfo=()=>protocol??=(read('get_protocol_info',[]).then(protocolGuard).catch(e=>{protocol=undefined;throw e}));
 return {getProtocolInfo,async getAssessment(request:string):Promise<AssessmentResult>{
  if(!hex64(request))throw new AppError('INVALID_INPUT','Invalid request ID');await getProtocolInfo();const result=await read('get_assessment',[request]) as {found:unknown;assessment?:unknown};
  if(result?.found===false&&Object.keys(result).length===1)return {found:false};
  if(result?.found!==true||Object.keys(result).sort().join(',')!=='assessment,found')throw new AppError('ONCHAIN_DATA_CONSISTENCY_ERROR','Unexpected get_assessment output');
  const assessment=verifyAssessment(result.assessment,request);const ids=await identifiers(assessment.creator,assessment.client_key,assessment);if(ids.request_id!==assessment.request_id||ids.payload_digest!==assessment.payload_digest)throw new AppError('ONCHAIN_DATA_CONSISTENCY_ERROR','Canonical identifier mismatch');return {found:true,assessment};
 },async lookupRequest(creator:string,key:string):Promise<Lookup>{
  if(!/^0x[0-9a-f]{40}$/i.test(creator)||!/^[A-Za-z0-9_-]{1,64}$/.test(key))throw new AppError('INVALID_INPUT','Invalid creator/key');await getProtocolInfo();const x=await read('lookup_request',[creator,key]) as Lookup;
  const rid=(await identifiers(creator,key,{claim:'x',context:'',urls:[]})).request_id;
  if(!x||typeof x.found!=='boolean'||x.request_id!==rid||(x.found?(Object.keys(x).sort().join(',')!=='found,payload_digest,request_id,result_status'||!hex64(x.payload_digest)||!['COMPLETE','PARTIAL'].includes(x.result_status)):Object.keys(x).sort().join(',')!=='found,request_id'))throw new AppError('ONCHAIN_DATA_CONSISTENCY_ERROR','Unexpected lookup result');return x;
 }};
}
// Wallet-free public client. No account/provider/signing/write/poll/retry path.
export const adapter=createReadAdapter(createClient({chain:studionet}));

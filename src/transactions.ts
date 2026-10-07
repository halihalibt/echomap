import {abi,createClient} from 'genlayer-js';
import type {Hash} from 'genlayer-js/types';
import {studionet} from 'genlayer-js/chains';
import {config} from './core';
import {FlowError,type Provider} from './wallet';
export interface TxOutcome {status:string;consensus?:string;execution?:'SUCCESS'|'ERROR';returns?:{request_id:string;disposition:'NEW'|'REUSED';result_status:string}[];raw:unknown}
function plain(x:unknown):any {if(x instanceof Map)return Object.fromEntries([...x].map(([k,v])=>[k,plain(v)]));if(Array.isArray(x))return x.map(plain);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,plain(v)]));return x}
export function transactionOutcome(raw:any):TxOutcome {
 const rounds=raw?.consensus_history?.consensus_results??[];const latest=rounds.at(-1);const leaders=latest?.leader_result??[];const returns=[];let execution:TxOutcome['execution'];
 for(const l of leaders){if(l.execution_result==='ERROR'){execution='ERROR';continue}const r=l.result;const base64=typeof r==='string'?r:r?.raw;if(typeof base64!=='string')continue;try{const bytes=Uint8Array.from(atob(base64),x=>x.charCodeAt(0));if(bytes[0]!==0){execution='ERROR';continue}const value=plain(abi.calldata.decode(bytes.slice(1)));if(l.execution_result==='SUCCESS'&&value&&Object.keys(value).sort().join(',')==='disposition,request_id,result_status'&&['NEW','REUSED'].includes(value.disposition)&&typeof value.request_id==='string'){returns.push(value);if(execution!=='ERROR')execution='SUCCESS'}}catch{execution='ERROR'}}
 return {status:raw?.statusName??'UNKNOWN',consensus:raw?.result_name,execution,returns,raw};
}
export function verifyTransactionBinding(raw:any,tx:string,p:{creator:string;contract:string;client_key:string;claim:string;context:string;urls:string[]}){
 const sender=raw?.sender??raw?.from_address;const recipient=raw?.recipient??raw?.to_address;
 if(raw?.hash?.toLowerCase()!==tx.toLowerCase()||sender?.toLowerCase()!==p.creator||recipient?.toLowerCase()!==p.contract.toLowerCase())throw new FlowError('REQUEST_ID_MISMATCH','Receipt transaction/sender/contract mismatch');
 try{const value=raw?.data?.calldata;const encoded=typeof value==='string'?value:value?.base64;if(typeof encoded!=='string')throw Error('Calldata not exposed');const call=plain(abi.calldata.decode(Uint8Array.from(atob(encoded),x=>x.charCodeAt(0))));if(Object.keys(call).sort().join(',')!=='args,method'||call.method!=='assess'||JSON.stringify(call.args)!==JSON.stringify([p.client_key,p.claim,p.context,p.urls]))throw Error('Assess input mismatch')}catch(e){throw new FlowError('REQUEST_ID_MISMATCH','Receipt calldata does not match prepared assess input',e)}
}
// Official locked SDK. Wallet is explicit; no global window.ethereum fallback.
export function createWriteAdapter(provider:Provider,account:`0x${string}`,guard:()=>Promise<void>){
 const readClient=createClient({chain:studionet});
 let sendRequested=false;
 const guarded:Provider={request:async a=>{if(a.method==='eth_sendTransaction'){if(sendRequested)throw new FlowError('TRANSACTION_SUBMISSION_FAILED','A wallet submission was already attempted; no automatic second send');
  const tx=a.params?.[0] as {from:string;chainId:string;to:`0x${string}`;data:`0x${string}`;value:string;gas:string};await guard();
  if(tx.from.toLowerCase()!==account.toLowerCase()||Number(tx.chainId)!==config.chainId||tx.to.toLowerCase()!==studionet.consensusMainContract!.address.toLowerCase()||BigInt(tx.value)!==0n)throw new FlowError('WRONG_NETWORK','Unexpected wallet transaction target');
  // SDK may silently fall back after a failed estimate. Re-estimate before signing and refuse failure.
  const gas=await readClient.estimateTransactionGas({from:account,to:tx.to,data:tx.data,value:0n});await guard();
  sendRequested=true;return provider.request({...a,params:[{...tx,gas:'0x'+gas.toString(16)}]});
 }return provider.request(a)}};
 const client=createClient({chain:studionet,account,provider:guarded});
 return {async assess(key:string,claim:string,context:string,urls:string[]){await guard();return client.writeContract({address:config.contract as `0x${string}`,functionName:'assess',args:[key,claim,context,urls],leaderOnly:false,value:0n,consensusMaxRotations:3})},async getTransaction(hash:`0x${string}`){return transactionOutcome(await readClient.getTransaction({hash:hash as Hash}))}};
}
export const receiptReader={async getTransaction(hash:`0x${string}`){return transactionOutcome(await createClient({chain:studionet}).getTransaction({hash:hash as Hash}))}};

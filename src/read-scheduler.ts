import {config} from './core';
export type ReadIssue='RATE_LIMITED'|'RPC_TEMPORARY_FAILURE'|'RPC_UNAVAILABLE'|'FINALIZED_READ_LAG'|'PROTOCOL_MISMATCH'|'NOT_FOUND'|'TRACKING_UNAVAILABLE'|'SUBMISSION_UNKNOWN';
export class ReadFailure extends Error {constructor(public issue:ReadIssue,message:string,public retryAfterMs=0,public cause?:unknown){super(message)}}
export function classifyReadError(error:unknown):ReadFailure {
 let x=error as any;for(let n=0;x&&n<8;n++,x=x.cause){if(x instanceof ReadFailure)return x;if(x.readIssue)return new ReadFailure(x.readIssue,x.message,0,error);if(Number(x.status??x.statusCode??x.code)===429||Number(x.code)===-32005)return new ReadFailure('RATE_LIMITED','RPC rate limited',Number(x.retryAfterMs)||0,error);if(x.kind==='CONFIGURATION_MISMATCH')return new ReadFailure('PROTOCOL_MISMATCH',x.message,0,error)}
 return new ReadFailure(typeof navigator!=='undefined'&&navigator.onLine===false?'RPC_UNAVAILABLE':'RPC_TEMPORARY_FAILURE',error instanceof Error?error.message:String(error),0,error);
}
export function retryDelay(headers:Headers,now=Date.now()){
 const ra=headers.get('Retry-After');let ms=ra?(/^\d+(\.\d+)?$/.test(ra)?Number(ra)*1000:Date.parse(ra)-now):0;
 if(!Number.isFinite(ms))ms=0;const reset=Number(headers.get('X-Ratelimit-Reset'));if(reset>0)ms=Math.max(ms,reset>1e9?reset*1000-now:reset*1000);
 return Number.isFinite(ms)?Math.max(0,ms):0;
}
export async function visible(){if(typeof document==='undefined'||!document.hidden)return;await new Promise<void>(resolve=>{const changed=()=>{if(!document.hidden){document.removeEventListener('visibilitychange',changed);resolve()}};document.addEventListener('visibilitychange',changed)})}
export class ReadScheduler {
 private tail:Promise<unknown>=Promise.resolve();private pending=new Map<string,Promise<unknown>>();cooldownUntil=0;private streak=0;
 constructor(private now=Date.now,private sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms)),private foreground=visible){}
 run<T>(key:string,read:()=>Promise<T>):Promise<T>{
  const existing=this.pending.get(key);if(existing)return existing as Promise<T>;
  const task=this.tail.catch(()=>{}).then(async()=>{
   for(let attempt=0;attempt<3;attempt++){
    await this.foreground();while(this.now()<this.cooldownUntil){await this.sleep(this.cooldownUntil-this.now());await this.foreground()}
    try{const result=await read();this.streak=0;return result}catch(error){const failure=classifyReadError(error);
     if(failure.issue==='RATE_LIMITED'){this.streak++;this.cooldownUntil=Math.max(this.cooldownUntil,this.now()+Math.max(failure.retryAfterMs,Math.min(60000,10000*2**Math.min(this.streak-1,3))))}
     if(attempt===2||!['RATE_LIMITED','RPC_TEMPORARY_FAILURE'].includes(failure.issue))throw failure;
     if(failure.issue==='RPC_TEMPORARY_FAILURE')await this.sleep(5000*(attempt+1));
    }
   }throw Error('Read budget exhausted');
  });this.tail=task;this.pending.set(key,task);void task.then(()=>this.pending.delete(key),()=>this.pending.delete(key));return task;
 }
}
export const sharedReads=new ReadScheduler();
const readMethods=new Set(['gen_call','eth_chainId','eth_getTransactionByHash','eth_getTransactionReceipt','eth_getTransactionCount','eth_gasPrice','eth_estimateGas','gen_getTransactionReceipt','gen_getTransactionLifecycle','gen_getTransactionStatus']);
// SDK1.1.8 uses global fetch (official installed source); its wallet methods remain untouched.
export function installReadScheduler(target:{fetch:typeof fetch}=globalThis,scheduler=sharedReads){
 const marker=Symbol.for('echomap.read-scheduler');if((target.fetch as any)[marker])return ()=>{};const original=target.fetch;const wrapped:typeof fetch=async(input,init)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(url!==config.rpc||typeof init?.body!=='string')return original.call(target,input,init);
  let q:{method:string;params?:unknown};try{q=JSON.parse(init.body)}catch{return original.call(target,input,init)}
  if(!readMethods.has(q.method))return original.call(target,input,init); // Writes are never scheduled/retried.
  const response=await scheduler.run(q.method+JSON.stringify(q.params??[]),async()=>{
   const response=await original.call(target,input,init);
   if(response.status===429)throw new ReadFailure('RATE_LIMITED','HTTP 429',retryDelay(response.headers));
   if(!response.ok)throw new ReadFailure(response.status>=500?'RPC_TEMPORARY_FAILURE':'RPC_UNAVAILABLE','RPC HTTP '+response.status);
   const body=await response.clone().json();if(body.error){const e=body.error;if(Number(e.code)===429||Number(e.code)===-32005||Number(e.data?.status)===429)throw new ReadFailure('RATE_LIMITED',e.message??'RPC rate limited',retryDelay(response.headers));throw new ReadFailure(Number(e.code)===-32601?'RPC_UNAVAILABLE':'RPC_TEMPORARY_FAILURE',e.message??'RPC read failed',0,e)}
   return response;
  });return response.clone();
 };Object.assign(wrapped,{[marker]:true});target.fetch=wrapped;return ()=>{if(target.fetch===wrapped)target.fetch=original};
}

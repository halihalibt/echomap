import {studionet} from 'genlayer-js/chains';
import {config} from './core';
export interface Provider {request(a:{method:string;params?:unknown[]}):Promise<unknown>;on?(name:string,handler:(x:unknown)=>void):void;removeListener?(name:string,handler:(x:unknown)=>void):void;isMetaMask?:boolean;isOkxWallet?:boolean;isOKExWallet?:boolean;providers?:Provider[]}
export interface WalletChoice {id:string;name:string;provider:Provider}
export type ErrorCode='USER_REJECTED_CONNECT'|'USER_REJECTED_NETWORK_SWITCH'|'USER_REJECTED_SIGNATURE'|'WRONG_NETWORK'|'ACCOUNT_CHANGED_BEFORE_SEND'|'INSUFFICIENT_TEST_GEN'|'TRANSACTION_SUBMISSION_FAILED'|'TRANSACTION_EXECUTION_FAILED'|'RPC_READ_FAILED'|'PROTOCOL_MISMATCH'|'REQUEST_ID_MISMATCH'|'IDEMPOTENCY_CONFLICT';
export class FlowError extends Error {constructor(public code:ErrorCode,message:string,public cause?:unknown){super(message)}}
export function rejected(e:unknown):boolean {let x=e as {code?:number;cause?:unknown};for(let i=0;x&&i<5;i++,x=x.cause as typeof x)if(Number(x.code)===4001)return true;return false}
export function discoverWallets(target:Window,onChange:(choices:WalletChoice[])=>void){
 type Entry=WalletChoice & {rdns?:string;uuid?:string;announced:boolean};
 let entries:Entry[]=[];let sequence=0;
 const family=(r:string|undefined)=>r==='com.okex.wallet'?'com.okx.wallet':r;
 const legacyFamily=(p:Provider)=>p.isOkxWallet||p.isOKExWallet?'com.okx.wallet':p.isMetaMask?'io.metamask':undefined;
 const valid=(p:Provider|undefined):p is Provider=>Boolean(p&&typeof p.request==='function');
 const publish=()=>onChange([...entries]);
 const announce=(event:Event)=>{
  const d=(event as CustomEvent<{info:{rdns:string;uuid:string;name:string};provider:Provider}>).detail;
  if(!valid(d?.provider)||typeof d.info?.uuid!=='string'||!d.info.uuid||typeof d.info.name!=='string'||!d.info.name.trim()||typeof d.info.rdns!=='string'||!d.info.rdns)return;
  const rdns=family(d.info.rdns.toLowerCase()),uuid=d.info.uuid;
  if(entries.some(x=>x.announced&&(x.provider===d.provider||(x.rdns===rdns&&x.uuid===uuid))))return;
  // Prefer announced metadata; never mutate a choice already bound to a session.
  entries=entries.filter(x=>x.announced||(x.provider!==d.provider&&x.rdns!==rdns));
  entries.push({id:'eip6963:'+rdns+':'+uuid,name:d.info.name.trim(),provider:d.provider,rdns,uuid,announced:true});publish();
 };
 target.addEventListener('eip6963:announceProvider',announce);target.dispatchEvent(new Event('eip6963:requestProvider'));
 const addLegacy=(p:Provider|undefined)=>{
  if(!valid(p)||entries.some(x=>x.provider===p))return;
  const rdns=legacyFamily(p);
  if(rdns&&entries.some(x=>x.rdns===rdns))return;
  entries.push({id:'legacy:'+sequence++,name:rdns==='com.okx.wallet'?'OKX Wallet':rdns==='io.metamask'?'MetaMask':'Injected EVM wallet',provider:p,rdns,announced:false});publish();
 };
 const w=target as unknown as {ethereum?:Provider;okxwallet?:Provider};addLegacy(w.okxwallet);
 if(w.ethereum?.providers?.length)for(const p of w.ethereum.providers)addLegacy(p);else addLegacy(w.ethereum);
 if(!entries.length)publish();
 return ()=>target.removeEventListener('eip6963:announceProvider',announce);
}
export class WalletSession {
 choice?:WalletChoice;account?:string;chainId?:number;revision=0;private detach?:()=>void;
 constructor(private changed:()=>void=()=>{}){}
 async connect(choice:WalletChoice){this.disconnect();this.choice=choice;const accountsChanged=(x:unknown)=>{this.account=Array.isArray(x)&&typeof x[0]==='string'?x[0].toLowerCase():undefined;this.revision++;this.changed()};const chainChanged=(x:unknown)=>{this.chainId=Number(x);this.revision++;this.changed()};choice.provider.on?.('accountsChanged',accountsChanged);choice.provider.on?.('chainChanged',chainChanged);this.detach=()=>{choice.provider.removeListener?.('accountsChanged',accountsChanged);choice.provider.removeListener?.('chainChanged',chainChanged)};
  try{const accounts=await choice.provider.request({method:'eth_requestAccounts'});accountsChanged(accounts);if(!this.account||!/^0x[0-9a-f]{40}$/.test(this.account))throw Error('No wallet account');this.chainId=Number(await choice.provider.request({method:'eth_chainId'}));this.changed()}catch(e){this.disconnect();throw new FlowError(rejected(e)?'USER_REJECTED_CONNECT':'TRANSACTION_SUBMISSION_FAILED','Wallet connection failed',e)}
 }
 disconnect(){this.detach?.();this.detach=undefined;this.choice=undefined;this.account=undefined;this.chainId=undefined;this.revision++;this.changed()}
 async ensureNetwork(){const p=this.choice?.provider;if(!p)throw new FlowError('WRONG_NETWORK','Connect a wallet first');try{if(Number(await p.request({method:'eth_chainId'}))!==config.chainId){try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x'+config.chainId.toString(16)}]})}catch(e){if(Number((e as {code?:number}).code)!==4902)throw e;await p.request({method:'wallet_addEthereumChain',params:[{chainId:'0x'+config.chainId.toString(16),chainName:studionet.name,rpcUrls:[config.rpc],nativeCurrency:studionet.nativeCurrency,blockExplorerUrls:[config.explorer]}]});await p.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x'+config.chainId.toString(16)}]})}}this.chainId=Number(await p.request({method:'eth_chainId'}));if(this.chainId!==config.chainId)throw new FlowError('WRONG_NETWORK','Wallet did not switch to Stable Studionet');this.changed()}catch(e){if(e instanceof FlowError)throw e;throw new FlowError(rejected(e)?'USER_REJECTED_NETWORK_SWITCH':'WRONG_NETWORK','Stable Studionet network switch failed',e)}}
 async assertBinding(choice:WalletChoice,account:string,revision:number){if(this.choice!==choice||this.account!==account||this.revision!==revision)throw new FlowError('ACCOUNT_CHANGED_BEFORE_SEND','Wallet/account/network changed; confirm preparation again');const accounts=await choice.provider.request({method:'eth_accounts'});if(!Array.isArray(accounts)||String(accounts[0]).toLowerCase()!==account)throw new FlowError('ACCOUNT_CHANGED_BEFORE_SEND','Account changed before signing');if(Number(await choice.provider.request({method:'eth_chainId'}))!==config.chainId)throw new FlowError('WRONG_NETWORK','Network changed before signing');if(this.choice!==choice||this.revision!==revision)throw new FlowError('ACCOUNT_CHANGED_BEFORE_SEND','Wallet changed during preparation')}
}

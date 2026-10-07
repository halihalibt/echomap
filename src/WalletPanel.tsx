import {useState} from 'react';
import {copy,type Language} from './i18n';
import {type WalletChoice,WalletSession} from './wallet';
type Text=(typeof copy)[Language];
export function connectDiscovered(choices:WalletChoice[],connect:(choice:WalletChoice)=>void,choose:()=>void){if(choices.length===1)connect(choices[0]);else if(choices.length>1)choose()}
export function WalletPanel({choices,wallet,onConnect,onDisconnect,disabled,text}:{choices:WalletChoice[];wallet:WalletSession;onConnect:(choice:WalletChoice)=>void;onDisconnect:()=>void;disabled:boolean;text:Text}){
 const [choosing,setChoosing]=useState(false);
 return <section className="panel">{wallet.account?<><p>{wallet.choice?.name} · {text.account}: <code>{wallet.account}</code></p><p>{text.network}: {wallet.chainId??'—'}</p><button className="secondary" onClick={onDisconnect} disabled={disabled}>{text.disconnect}</button><small>{text.detachHelp}</small></>:<><button disabled={disabled||!choices.length} onClick={()=>connectDiscovered(choices,onConnect,()=>setChoosing(true))}>{text.connect}</button>{!choices.length&&<p>{text.noWallet}</p>}{choosing&&choices.length>1&&<div role="group" aria-label={text.chooseWallet}><p>{text.chooseWallet}</p>{choices.map(x=><button className="secondary" key={x.id} disabled={disabled} onClick={()=>{setChoosing(false);onConnect(x)}}>{x.name}{choices.filter(y=>y.name===x.name).length>1&&<small> · {x.id}</small>}</button>)}</div>}</>}<p><small>{text.walletCompatibility}</small></p></section>
}

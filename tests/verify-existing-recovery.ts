// Two-process restart of recovery coordinates for an ALREADY FINALIZED real transaction.
// Not a real browser refresh, pending-network test, or new wallet transaction.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {RecoveryStore,type StorageLike} from '../src/recovery';
import {WalletSession} from '../src/wallet';
import {WriteController} from '../src/controller';
import {installReadScheduler} from '../src/read-scheduler';
import {Report} from '../src/App';
import {config} from '../src/core';
const path='evidence/phase7-process-recovery-storage.json';
const storage:StorageLike={getItem(){return fs.existsSync(path)?fs.readFileSync(path,'utf8'):null},setItem(_key,value){fs.writeFileSync(path,value)}};
const store=new RecoveryStore(storage);
const tx='0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df';
const a=JSON.parse(fs.readFileSync('evidence/real-wallet-e2e-finalized-assessment.json','utf8')).assessment;
if(process.argv[2]==='seed'){
 const prepared={creator:a.creator,client_key:a.client_key,claim:a.claim,context:a.context,urls:a.urls,request_id:a.request_id,payload_digest:a.payload_digest,contract:config.contract};
 store.save(prepared,{prepared,tx,lastState:'submitted',phase:'tracking',submittedAt:Date.now()});
 console.log('Saved recovery coordinates for existing FINALIZED transaction; no network call, no write.');
}else{
 const trace:string[]=[];const original=globalThis.fetch;globalThis.fetch=async(input,init)=>{const method=JSON.parse(String(init?.body)).method;assert.ok(['gen_call','eth_getTransactionByHash'].includes(method),'Only official SDK read methods permitted');trace.push(method);return original(input,init)};
 const clean=installReadScheduler();const active=store.load()?.active;assert.ok(active);const wallet=new WalletSession();const states:string[]=[];let opened='';
 const c=new WriteController(wallet,s=>states.push(s.state),undefined,()=>{throw Error('No writes permitted')},undefined,id=>opened=id,{store});
 try{await c.recover(active);assert.equal(c.snapshot.state,'finalized_partial');assert.equal(c.snapshot.tx,tx);assert.equal(opened,a.request_id);assert.equal(wallet.account,undefined);const result=c.snapshot.assessment;assert.ok(result?.found);assert.deepEqual(result.assessment.pairs,a.pairs);assert.equal(result.assessment.payload_digest,a.payload_digest);
 fs.writeFileSync('evidence/phase7-live-recovered-report.html',renderToStaticMarkup(React.createElement(Report,{assessment:result.assessment})));
 fs.writeFileSync('evidence/phase7-existing-recovery-verification.json',JSON.stringify({scope:'REAL READ-ONLY EXISTING FINALIZED TRANSACTION + TWO-PROCESS RESTART; NOT BROWSER REFRESH OR NEW E2E',transaction:tx,request_id:a.request_id,network:config.network,chainId:config.chainId,contract:config.contract,states,finalState:c.snapshot.state,actualCounts:[result.assessment.dependent_pair_count,result.assessment.independent_pair_count,result.assessment.unknown_pair_count],rpcMethods:trace,walletConnected:false,newTransactions:0,newDeployments:0,browserRefresh:'NOT_VERIFIED: Cloud Browser localhost ERR_CONNECTION_REFUSED',time:new Date().toISOString()},null,2));
 console.log('Existing-finalized recovery PASS; new process loaded same tx/key and reached actual finalized report, wallet-free.');
 }finally{clean();globalThis.fetch=original}
}

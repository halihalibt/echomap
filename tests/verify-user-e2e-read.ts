// Existing user transaction ONLY; no signer, no writes, no new transaction.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {receiptReader,verifyTransactionBinding} from '../src/transactions';
import {adapter} from '../src/genlayer';
import {config,identifiers} from '../src/core';
const tx='0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df';
const request='1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190';
const receipt=await receiptReader.getTransaction(tx);
fs.writeFileSync('evidence/real-wallet-e2e-receipt.json',JSON.stringify(receipt,(_,v)=>typeof v==='bigint'?String(v):v,2));
assert.equal(receipt.status,'FINALIZED');assert.equal(receipt.consensus,'MAJORITY_AGREE');assert.equal(receipt.execution,'SUCCESS');assert.ok(receipt.returns?.length&&receipt.returns.every(x=>x.disposition==='NEW'&&x.request_id===request));
const result=await adapter.getAssessment(request);
fs.writeFileSync('evidence/real-wallet-e2e-finalized-assessment.json',JSON.stringify(result,null,2));
assert.equal(result.found,true);if(!result.found)throw Error('No assessment');const a=result.assessment;
verifyTransactionBinding(receipt.raw,tx,{...a,contract:config.contract});assert.deepEqual(await identifiers(a.creator,a.client_key,a),{request_id:request,payload_digest:a.payload_digest});
assert.deepEqual(a.pairs.map(x=>x.relation),['DEPENDENT','INDEPENDENT','UNKNOWN','UNKNOWN','UNKNOWN','UNKNOWN']);assert.deepEqual([a.dependent_pair_count,a.independent_pair_count,a.unknown_pair_count],[1,1,4]);assert.equal(a.result_status,'PARTIAL');assert.deepEqual(a.max_supported_independent_set,[0,2]);assert.equal(a.max_supported_independent_set_size,2);
console.log('Existing user E2E receipt + finalized record + request-ID/input binding PASS; new transactions 0');

// Read-only compatibility check of a pre-existing PHASE4 receipt, NEVER a PHASE6 wallet E2E proof.
import fs from 'node:fs';
import {receiptReader} from '../src/transactions';
import {demos,config} from '../src/core';
const receipt=await receiptReader.getTransaction(demos[0].creation_transaction as `0x${string}`);
if(receipt.status!=='FINALIZED'||receipt.execution!=='SUCCESS'||receipt.consensus!=='MAJORITY_AGREE'||!receipt.returns?.length||receipt.returns.some(x=>x.request_id!==demos[0].request_id))throw Error('Stable receipt mapping mismatch');
const r=receipt.raw as any;if(r.recipient?.toLowerCase()!==config.contract.toLowerCase())throw Error('Wrong receipt contract');
fs.writeFileSync('evidence/phase6-receipt-read.json',JSON.stringify({type:'REAL READ ONLY / EXISTING PHASE4 TRANSACTION; NOT FRONTEND-ORIGINATED PHASE6 E2E',transaction:demos[0].creation_transaction,status:receipt.status,execution:receipt.execution,consensus:receipt.consensus,returns:receipt.returns,recipient:r.recipient,time:new Date().toISOString(),newTransactions:0},null,2));
console.log('Existing Stable receipt adapter read PASS; PHASE6 wallet E2E NOT VERIFIED');

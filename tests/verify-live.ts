// Read-only verification: official SDK, no account/wallet/write/model execution.
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {adapter} from '../src/genlayer';
import {demos,config} from '../src/core';
import {Report} from '../src/App';
const methods:string[]=[];const realFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>{const request=typeof options?.body==='string'?JSON.parse(options.body):null;if(request?.method){methods.push(request.method);if(request.method!=='gen_call'||request.params?.[0]?.type!=='read'||request.params?.[0]?.transaction_hash_variant!=='latest-final')throw Error('Only finalized gen_call/read permitted');}return realFetch(url,options)};
const protocol=await adapter.getProtocolInfo();const reports=[];
for(const demo of demos){const result=await adapter.getAssessment(demo.request_id);if(!result.found)throw Error('Verified demo not found');const a=result.assessment;const lookup=await adapter.lookupRequest(a.creator,a.client_key);if(!lookup.found||lookup.request_id!==a.request_id||lookup.payload_digest!==a.payload_digest||lookup.result_status!==a.result_status)throw Error('Lookup mismatch');const html=renderToStaticMarkup(React.createElement(Report,{assessment:a}));fs.writeFileSync(`evidence/live-${demo.label==='SYNTHETIC DEMO'?'synthetic':'public-document'}.html`,html);reports.push({demo,result,lookup,rendered_from_live_read:true});}
fs.writeFileSync('evidence/read-only-verification.json',JSON.stringify({mode:'REAL STABLE STUDIONET / FINALIZED READ ONLY; NO WALLET OR WRITE',config,protocol,reports,rpc_methods:methods,write_transactions:0,time:new Date().toISOString()},null,2)+'\n');console.log(JSON.stringify({gate:'PASS',contract:config.contract,reports:reports.length,rpc_methods:methods,write_transactions:0}));

import raw from './config/deployment.json';
import manifest from './config/verified-demo.json';
import { AppError, type Assessment, type ProtocolInfo, type Relation } from './types';
const fail=(s:string):never=>{throw new AppError('ONCHAIN_DATA_CONSISTENCY_ERROR',s)};
export const hex64=(x:unknown):x is string=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
export function parseConfig(x:typeof raw){
 if(x.network!=='Stable Studionet'||x.chainId!==61999||!/^0x[0-9a-fA-F]{40}$/.test(x.contract)||x.rpc!=='https://studio.genlayer.com/api'||x.protocolVersion!=='EIM-V1-STUDIO'||x.schemaVersion!=='EIM-CANDIDATE-V1'||!hex64(x.sourceCommit.padEnd(64,'0'))||x.sourceCommit.length!==40)throw new AppError('CONFIGURATION_MISMATCH','Unsupported deployment configuration');
 return x;
}
export const config=parseConfig(raw);
export const demos=manifest;
export function validateManifest(xs=manifest){
 for(const x of xs){if(Object.keys(x).sort().join(',')!=='contract,creation_transaction,label,network,protocol_version,request_id'||x.contract!==config.contract||x.network!==config.network||x.protocol_version!==config.protocolVersion||!hex64(x.request_id)||!/^0x[0-9a-f]{64}$/.test(x.creation_transaction)||!['SYNTHETIC DEMO','REAL PUBLIC DOCUMENT EXAMPLE'].includes(x.label))throw new AppError('CONFIGURATION_MISMATCH','Invalid demo navigation manifest')}
 return xs;
}
validateManifest();
export function protocolGuard(x:unknown):ProtocolInfo {
 const p=x as ProtocolInfo;
 const same=(a:unknown,b:unknown):boolean=>JSON.stringify(a)===JSON.stringify(b);
 if(!p||Object.keys(p).sort().join(',')!=='limits,protocol_version,relation_rules,schema_version,source_rules'||p.protocol_version!==config.protocolVersion||p.schema_version!==config.schemaVersion||p.relation_rules!==config.rulesIdentifier||!p.limits||Object.keys(p.limits).sort().join(',')!==Object.keys(config.limits).sort().join(',')||Object.entries(config.limits).some(([k,v])=>p.limits[k]!==v)||!p.source_rules||Object.keys(p.source_rules).sort().join(',')!=='extensions,hosts,scheme'||p.source_rules.scheme!==config.sourceRules.scheme||!same(p.source_rules.extensions,config.sourceRules.extensions)||!same(p.source_rules.hosts,config.sourceRules.hosts))throw new AppError('CONFIGURATION_MISMATCH','Contract protocol/schema/rules mismatch');
 return p;
}
// Exact Python str.strip whitespace, including U+001C–001F/U+0085; no NFC or extra URL cleanup.
const ws='[\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]';
export function normalizeText(x:string){const s=x.replace(/\r\n?/g,'\n').replace(/^\uFEFF/,'').replace(new RegExp(`^${ws}+|${ws}+$`,'g'),'');if(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(s))throw new AppError('INVALID_INPUT','Invalid UTF-8 text');return s}
export const codepoints=(x:string)=>[...x].length;
export function normalizeUrl(x:string){
 if(!/^[\x21-\x7e]+$/.test(x)||/[\\?#]/.test(x))throw new AppError('INVALID_INPUT','URL must be ASCII HTTPS without query/fragment');
 const m=/^https:\/\/([^/]+)(\/.*)?$/i.exec(x);if(!m)throw new AppError('INVALID_INPUT','HTTPS required');
 let host=m[1].toLowerCase();const parts=host.split(':');if(parts.length>2||(parts.length===2&&(!/^\d+$/.test(parts[1])||Number(parts[1])!==443)))throw new AppError('INVALID_INPUT','Only HTTPS port443 allowed');host=parts[0];
 const owner=/^([a-z0-9]+(?:-[a-z0-9]+)*)\.github\.io$/.exec(host);
 const path=m[2]||'/';if(!(host==='raw.githubusercontent.com'||(owner&&owner[1].length<=39))||/%(?![0-9a-f]{2})/i.test(path)||path.split('/').some(s=>['.','..'].includes(s.replace(/%2e/ig,'.')))||!config.sourceRules.extensions.some(ext=>path.endsWith(ext)))throw new AppError('INVALID_INPUT','Unsupported source URL');
 const result='https://'+host+path;if(result.length>config.limits.url_bytes)throw new AppError('INVALID_INPUT','URL exceeds512bytes');return result;
}
export function normalizePack(claim:string,context:string,urls:string[]){
 const c=normalizeText(claim),ctx=normalizeText(context);
 if(!c||codepoints(c)>config.limits.claim||codepoints(ctx)>config.limits.context||urls.length<2||urls.length>4)throw new AppError('INVALID_INPUT','Claim/context/source limits exceeded');
 const sorted=urls.map(normalizeUrl).sort();if(new Set(sorted).size!==sorted.length)throw new AppError('INVALID_INPUT','Duplicate normalized URL');return {claim:c,context:ctx,urls:sorted};
}
export async function hash(value:unknown){const data=new TextEncoder().encode(JSON.stringify(value));const bytes=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function identifiers(creator:string,key:string,p:{claim:string;context:string;urls:string[]}){
 if(!/^0x[0-9a-f]{40}$/i.test(creator)||!/^[A-Za-z0-9_-]{1,64}$/.test(key))throw new AppError('INVALID_INPUT','Invalid creator/key');
 return {request_id:await hash([config.protocolVersion,creator.toLowerCase(),key]),payload_digest:await hash([config.protocolVersion,p.claim,p.context,p.urls])};
}
export function matrix(record:Assessment){const n=record.sources.length;const rows:(Relation|'SELF')[][]=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?'SELF':'UNKNOWN'));for(const p of record.pairs){rows[p.i][p.j]=rows[p.j][p.i]=p.relation}return rows}
export function derive(record:Assessment){
 const counts={DEPENDENT:0,INDEPENDENT:0,UNKNOWN:0};for(const p of record.pairs)counts[p.relation]++;
 const eligible=record.sources.filter(s=>s.read_status==='READABLE'&&s.relevance==='RELEVANT').map(s=>s.index);const edges=new Map(record.pairs.map(p=>[`${p.i},${p.j}`,p.relation]));let best:number[]=[];
 for(let mask=0;mask<(1<<eligible.length);mask++){const set=eligible.filter((_,i)=>mask&(1<<i));let valid=true;for(let i=0;i<set.length;i++)for(let j=i+1;j<set.length;j++)if(edges.get(`${set[i]},${set[j]}`)!=='INDEPENDENT')valid=false;
 if(valid&&(set.length>best.length||(set.length===best.length&&set.join(',')<best.join(','))))best=set;}
 return {dependent_pair_count:counts.DEPENDENT,independent_pair_count:counts.INDEPENDENT,unknown_pair_count:counts.UNKNOWN,result_status:counts.UNKNOWN?'PARTIAL':'COMPLETE',max_supported_independent_set:best,max_supported_independent_set_size:best.length};
}
function exact(x:unknown,keys:string[]){if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).sort().join(',')!==keys.sort().join(','))fail('Unexpected schema fields')}
export function verifyAssessment(x:unknown,request:string):Assessment{
 exact(x,['protocol_version','request_id','creator','client_key','payload_digest','claim','context','urls','sources','pairs','result_status','max_supported_independent_set','max_supported_independent_set_size','dependent_pair_count','independent_pair_count','unknown_pair_count']);const a=x as Assessment;
 if(a.protocol_version!==config.protocolVersion)throw new AppError('CONFIGURATION_MISMATCH','Assessment protocol mismatch');
 if(!hex64(a.request_id)||a.request_id!==request||!hex64(a.payload_digest)||typeof a.creator!=='string'||!/^0x[0-9a-f]{40}$/.test(a.creator)||typeof a.client_key!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(a.client_key)||typeof a.claim!=='string'||typeof a.context!=='string'||!Array.isArray(a.urls)||a.urls.some(v=>typeof v!=='string')||!Array.isArray(a.sources)||!Array.isArray(a.pairs))fail('Invalid record fields');
 let urls:string[];try{urls=normalizePack('x','',a.urls).urls;if(!a.claim||codepoints(a.claim)>config.limits.claim||codepoints(a.context)>config.limits.context||normalizeText('\uFEFF'+a.claim)!==a.claim||normalizeText('\uFEFF'+a.context)!==a.context)fail('Stored text invariant');}catch{fail('Noncanonical stored input');}
 if(JSON.stringify(urls!)!==JSON.stringify(a.urls))fail('Noncanonical URL order');
 const n=a.urls.length;if(a.sources.length!==n||a.pairs.length!==n*(n-1)/2)fail('Incomplete source/pair arrays');
 a.sources.forEach((s,i)=>{exact(s,['index','url','read_status','content_digest','relevance']);if(s.index!==i||s.url!==a.urls[i]||!['READABLE','UNAVAILABLE','UNSUPPORTED'].includes(s.read_status)||!['RELEVANT','NOT_RELEVANT','UNCERTAIN','NOT_APPLICABLE'].includes(s.relevance))fail('Invalid source');if(s.read_status==='READABLE'?(!hex64(s.content_digest)||s.relevance==='NOT_APPLICABLE'):(s.content_digest!==null||s.relevance!=='NOT_APPLICABLE'))fail('Source invariant');});
 let k=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const p=a.pairs[k++];exact(p,['i','j','relation']);if(p.i!==i||p.j!==j||!['DEPENDENT','INDEPENDENT','UNKNOWN'].includes(p.relation))fail('Invalid pair/order');if([i,j].some(v=>a.sources[v].read_status!=='READABLE'||a.sources[v].relevance!=='RELEVANT')&&p.relation!=='UNKNOWN')fail('Ineligible positive pair');}
 const calculated=derive(a);for(const [key,value] of Object.entries(calculated))if(JSON.stringify(a[key as keyof Assessment])!==JSON.stringify(value))fail(`Stored ${key} disagrees with deterministic recomputation`);
 return a;
}
export function parseRoute(hash:string):{view:'start'|'progress'|'report'|'invalid';request?:string}{if(hash===''||hash==='#/'||hash==='#')return {view:'start'};if(hash==='#/progress')return {view:'progress'};const m=/^#\/report\/([0-9a-f]{64})$/.exec(hash);return m?{view:'report',request:m[1]}:{view:'invalid'}}

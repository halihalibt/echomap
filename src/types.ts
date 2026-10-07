export type Relation = 'DEPENDENT' | 'INDEPENDENT' | 'UNKNOWN';
export type Relevance = 'RELEVANT' | 'NOT_RELEVANT' | 'UNCERTAIN' | 'NOT_APPLICABLE';
export type ReadStatus = 'READABLE' | 'UNAVAILABLE' | 'UNSUPPORTED';
export interface SourceObservation { index:number; url:string; read_status:ReadStatus; content_digest:string|null; relevance:Relevance }
export interface PairDecision { i:number; j:number; relation:Relation }
export interface Assessment { protocol_version:string; request_id:string; creator:string; client_key:string; payload_digest:string; claim:string; context:string; urls:string[]; sources:SourceObservation[]; pairs:PairDecision[]; result_status:'COMPLETE'|'PARTIAL'; max_supported_independent_set:number[]; max_supported_independent_set_size:number; dependent_pair_count:number; independent_pair_count:number; unknown_pair_count:number }
export type AssessmentResult = {found:false} | {found:true;assessment:Assessment};
export interface ProtocolInfo { protocol_version:string;schema_version:string;relation_rules:string;limits:Record<string,number>;source_rules:{extensions:string[];hosts:string[];scheme:string} }
export type Lookup = {found:false;request_id:string} | {found:true;request_id:string;payload_digest:string;result_status:'COMPLETE'|'PARTIAL'};
export type FailureKind='TRANSPORT_ERROR'|'CONFIGURATION_MISMATCH'|'ONCHAIN_DATA_CONSISTENCY_ERROR'|'INVALID_INPUT';
export class AppError extends Error { constructor(public kind:FailureKind, message:string){super(message)} }

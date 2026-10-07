# PHASE7_RELIABILITY

Updated UTC: 2026-10-07T13:04:05.325261+00:00

PHASE7 = PASS / AWAITING USER REVIEW. No PHASE8 work authorized.

## Recovery protocol
One localStorage key `echomap-recovery-v1`, local schema version1. Record fields: version,network,chainId,contract,draft; optional active(prepared,wallet ID/name,tx,submittedAt,lastState,phase). Draft holds client_key,claim,context,URLs. Prepared adds creator,request_id,payload_digest,canonical contract. Active phases: submission_unknown,tracking,finalized_reading,completed,terminal_failed. These are frontend recovery flags, not business enums or chain schema changes.

Save draft edits and save immutable normalized identity BEFORE entering signature/SDK submission. Save actual valid GenLayer tx ID as soon as returned. Reload validates network/contract/schema, input consistency and recomputed canonical hashes before any recovered tracking. LocalStorage is untrusted navigation/input metadata; it cannot prove finality or supply Assessment data. A saved completed hint cannot prove success: its tx receipt is rechecked once for actual finality/binding before the fresh finalized getter/report. Once finalized, no continuing transaction poll is created. Finalized read lag after that proof only retries the getter; a refreshed runtime rechecks its receipt once.

Unknown without tx ID: finalized lookup_request for saved creator/key. Matching ID/digest → fresh matching Assessment read. found=false → Submission status unknown; keep original key/payload and lock write/New. Conflicting record/hash → stop safely. Never infer pending absence from a finalized miss. No account reconnection, indexer, history scan or automatic retry. A pre-sign read failure is distinguished from unknown post-sign submission; Resume can recheck reads without sending. Known signature refusal retains the key but clears the possible-submission flag because no write was accepted.

Storage unavailable/quota failure: explicit warning, runtime controller still protects writes but refresh recovery cannot be guaranteed. Damaged/wrong-network/version recovery is preserved and submission disabled. No silent discard/new write. Editable invalid draft text can survive refresh; normal frozen submission validation still rejects it.

## Poll/read ownership
The existing controller owns one sequential loop. It reserves the busy lock before asynchronous recovery; overlapping Resume/recover cannot add a poller. Route changes do not instantiate another controller. A selected wallet/account switch after submission cannot rewrite recovered creator/input or affect wallet-free receipt/getter reads.

Polling:5s for first12 cycles,10s until36,15s thereafter; maximum120 cycles. No interval,1s loop or compensation ticks. Hidden document waits on visibilitychange, then continues one loop. Completion stops the transaction loop; public report rendering is a finalized read. Read timeout/budget/transport failure is tracking_unavailable and preserves IDs, never execution failure. After six controlled found=false finalized-getter reads, retain finalized proof/IDs and offer Resume.

## SDK transport constraint and thin adapter
Exact locked SDK genlayer-js1.1.8 source `dist/index.js` getCustomTransportConfig/createClient uses global fetch, parses JSON, and exposes no custom HTTP status/header hook in createClient config (account,chain,endpoint,provider). Its custom transport retryCount is0. A one-time fetch shim is limited to exact canonical RPC `https://studio.genlayer.com/api` and a finite read-method allowlist. Installed in main.tsx before effects/requests. Other URLs and wallet/write methods pass through once, without scheduling/retry. No SDK monkeypatch on signing or contract APIs; the original guarded write adapter is byte-identical. Duplicate installation does not nest schedulers.

All protocol/getter/lookup/receipt and read-only fee preparation RPCs share the scheduler; operations serialize and identical in-flight reads coalesce. HTTP429/RPC explicit limit errors preserve rate classification and HTTP Retry-After (seconds/date)/X-Ratelimit-Reset. Cooldown minimum10s; consecutive rate errors double to20/40/60s cap, while longer server hints take precedence. Each read has at most3 attempts; queue checks shared cooldown before each dispatch. Success resets consecutive429 state. Temporary failures use5/10s bounded read delays; explicitly unavailable/offline errors pause. The scheduler owns retries; UI/controller never adds an error-retry storm. Valid found=false is not retried by HTTP scheduler or treated as transport failure. Protocol cache clears a rejected promise for explicit read recovery, while compatibility guards remain unchanged.

## UI classification
RATE_LIMITED; RPC_TEMPORARY_FAILURE; RPC_UNAVAILABLE; FINALIZED_READ_LAG; PROTOCOL_MISMATCH; valid NOT_FOUND; TRACKING_UNAVAILABLE; SUBMISSION_UNKNOWN. Actual network execution failure continues TRANSACTION_EXECUTION_FAILED. Bilingual fixed copy explains read pause versus execution failure. No new lifecycle enum, page, visual redesign or business feature.

## Guarantees / evidence limits
NEVER RETRY A WRITE AUTOMATICALLY. Original fee/signing/provider/account/chain/hash/contract guards remain. Accepted is not success; FINALIZED +MAJORITY_AGREE +SUCCESS +matching finalized Assessment still required. No source/model/UNKNOWN semantic change.

127 local tests PASS;43 new focused cases alongside84 untouched regressions. Real read-only recovery of existing user transaction `0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df` reached its actual finalized report in a new Node process with no wallet and three RPC reads. This is a process restart, not an actual browser refresh or newly pending transaction. Cloud Browser localhost attempt returned ERR_CONNECTION_REFUSED; no browser stack installed or additional probing. Real pending/background/offline429/user-browser recovery remain mock-verified, not newly network-verified. The original PHASE6 real wallet E2E stays valid with actual1D/1I/4U result.

Module cooldown survives rerenders and routes within one app runtime; it is not persisted across full reload or shared between separate tabs/devices. Storage recovery is origin/browser-local; no cross-device sync. Unknown no-ID submission can remain locked until a matching finalized record appears or external evidence/user decision establishes another safe action; no UI bypass is provided. Terminal failure evidence is retained until the user explicitly starts New Assessment. No change to A, deployment, canonical contract, Freeze or ACR001. No HIGH complexity/new dependency.

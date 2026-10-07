# REAL_BROWSER_RECOVERY_EVIDENCE

Updated UTC: 2026-10-07T16:54:08.864548+00:00

## Accepted result
**REAL MULTI-REFRESH RECOVERY = VERIFIED**
**REAL FAILURE TERMINAL TRACKING = VERIFIED**
Evidence combines user-confirmed local-browser operation, five unaltered screenshots and four current official SDK read-only RPC calls. The user explicitly approved PHASE8 closure using this failure-state recovery together with PHASE6's separate successful wallet E2E. No second transaction is required or authorized.

| Field | Actual evidence / scope |
|---|---|
| Browser Environment | User local browser; brand/version/OS not independently established by these cropped screenshots |
| Wallet | Real user wallet submission confirmed; exact brand/version NOT_ESTABLISHED |
| Network | Stable Studionet /61999 visible in every screenshot |
| Contract |`0x7045b893E15B699e04494aA3849730bC6Aa1C864` visible; actual receipt recipient/input binding checked |
| Transaction ID |`0x2915b28c0963aa42d026169e5181e93c3ff673ffa01e0485724e575aed4bf20d` |
| Request ID |`8bcc1dcb3ba13df648d68b9e81d01c2257695265c988a91cd5978d414076f350` |
| Client Key |`echo-33faa1919c7b4f4fa2247bfbfa1320dd` |
| Creator |`0x22acaa233b7b985b36ef168f2de9295334065b15` from actual receipt |
| Payload Digest |`e06b4af4688ba1f6a14bf60d8b350846ca8cf622c9945c4bf482ac60d7b83391` recomputed from exact sender/key/frozen input |
| State Before/Across Refresh | User reports multiple refreshes during lifecycle; screenshots show pending/PENDING and pending/COMMITTING |
| Refresh Action | Multiple manual browser refreshes; exact count/timing not recorded |
| State After Refresh | User confirms same transaction/request/key/contract on every refresh; screenshots preserve them through failure terminal |
| Recovered Transaction / Request / Key | Same values above; VERIFIED from user confirmation +visible lifecycle screenshots |
| Duplicate Write Check | VERIFIED for this manual workflow: user confirms one submission, no second tx/write/key; only one tx captured. Not an exhaustive account-history scan |
| No Re-sign After Refresh |VERIFIED from user explicit operation confirmation; screenshots alone cannot prove wallet popup absence |
| Single Poller |LOCAL TEST VERIFIED; real runtime count/timing NOT_INDEPENDENTLY_MEASURED (no HAR/video supplied) |
| Finality |Actual current receipt FINALIZED; final screenshot FINALIZED; earlier screenshot UNDETERMINED retained rather than rewritten |
| Execution |SUCCESS for exposed Leader execution; this does not mean consensus/assessment success |
| Consensus |MAJORITY_DISAGREE, honestly retained |
| Finalized Assessment |`get_assessment(8bcc1dcb3ba13df648d68b9e81d01c2257695265c988a91cd5978d414076f350) = found:false` |
| Finalized Lookup |`lookup_request(creator,client_key) = found:false`, matching request_id |
| Shared Report |Correctly no successful report for this failed consensus; UI execution_failed/TRANSACTION_EXECUTION_FAILED |
| Browser Smoke |Visible application/progress/network/contract/status/ID/failure message work. Chinese button visible; toggle/home/example/selection/narrow layout not separately documented in these screenshots; retained local/previous-phase coverage, not claimed newly observed |
| 429 Real Observation |NOT_OBSERVED /NOT_INSTRUMENTED; no intentional traffic; focused tests remain main evidence |
| Tests |127 PASS /0failed/0skipped once in PHASE8 preflight; all33 baseline source/test/config/evidence hashes unchanged at closure. Not rerun without changes |
| Build |PASS once in PHASE8 preflight; retained776.12kB bundle warning; production unchanged |
| Real Transactions Sent |1 user-controlled NEW in this phase;0 Work-side writes; no duplicate reported |
| Redeployment / cash |0 new deployments /0 new cash expense |
| Architecture Change Requests |NONE |

## Verification classification
- TRANSACTION ID PERSISTENCE = VERIFIED.
- REQUEST ID PERSISTENCE = VERIFIED.
- CLIENT KEY PERSISTENCE = VERIFIED.
- NO DUPLICATE WRITE = VERIFIED (user-confirmed manual workflow scope).
- NO RE-SIGN AFTER REFRESH = VERIFIED (user-confirmed).
- REAL FAILURE TERMINAL TRACKING = VERIFIED.
- PHASE8 successful NEW/finalized Assessment/Shared Report = NOT ACHIEVED by this transaction, and never asserted.
- REAL PENDING-STATE MULTI-REFRESH = user-confirmed and supported by matching pending/committing/final screenshots; no independent recording of F5 events. It is not a simulated/unit-test refresh claim.

## Screenshot and read-only evidence
`evidence/phase8-user-screenshots/`:five byte-preserved user screenshots; `phase8-screenshot-index.json`:filename/hash/visible facts. `phase8-user-attestation.json`:explicit operational confirmation and limits.
`phase8-existing-transaction-receipt.json`:complete actual SDK-exposed receipt/outcome.
`phase8-read-only-verification.json` and log:actual finality/consensus/execution, decoded official ABI calldata, canonical request/payload hashes, protocol result and finalized get/lookup. Allowed RPC methods were one eth_getTransactionByHash plus three gen_call (protocol/get/lookup). No signer/account injection/simulation/transaction submission or new model diagnosis.

## Separate PHASE6 success proof, unchanged
**PHASE6: REAL SUCCESSFUL WALLET E2E**. Transaction0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df; request1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190. FINALIZED/SUCCESS/MAJORITY_AGREE, finalized found=true and actual Shared Report; PARTIAL1D/1I/4U,MIS[A,C],size2. Original receipt,record,report/screenshots/docs remain byte-identical. This proves successful path, not successful outcome of the PHASE8 failed transaction.

## Known limitations / stop
No HAR, video or exported localStorage snapshot; technical per-runtime poller count not measured. No claim of independent complete account-history proof, unknown-submission refresh, real429 or current brand-specific wallet E2E. Consensus disagreement is an actual unsuccessful observation and shows no guaranteed success/liveness on every input; no cause investigation, result repair, retry or contract modification performed. Preserve it for submission transparency. User-approved combined Gate: PHASE8 PASS / CLOSED. STOP; PHASE9 NOT_AUTHORIZED.

# REAL_WALLET_E2E_EVIDENCE

Updated UTC: 2026-10-07T12:32:22.386241+00:00

**REAL WALLET E2E VERIFIED BEFORE UX PATCH**
**UX PATCH DID NOT CHANGE TRANSACTION SEMANTICS**

## Verification scope
User personally completed the browser-wallet → EchoMap → assess → Stable → finalized getter → Shared Report flow before this patch. User-provided screenshots are preserved unchanged under `evidence/user-e2e-screenshots/`. The missing scratch copies were recovered from the authorized uploads. The UI screenshots show pending, accepted-awaiting-finality, and the final wallet-free report. Accepted alone was not treated as success. Wallet brand for this particular successful E2E is not established by the supplied screenshots; neither brand nor every compatible wallet is claimed individually real-E2E verified.

This closure made only read-only official SDK1.1.8 calls for the existing transaction and `LATEST_FINAL` contract reads. No new signer, wallet E2E, write, assessment, faucet claim or deployment was performed.

## Actual transaction and canonical binding
- Network: Stable Studionet / Chain61999
- Contract: `0x7045b893E15B699e04494aA3849730bC6Aa1C864`
- Transaction: `0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df`
- Request: `1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190`
- Creator: `0x22acaa233b7b985b36ef168f2de9295334065b15`
- client_key: `echo-3c5df99d6e2b471695291c639e8576c4`
- Protocol: `EIM-V1-STUDIO`
- payload_digest: `e06b4af4688ba1f6a14bf60d8b350846ca8cf622c9945c4bf482ac60d7b83391`
- Explorer: https://explorer-studio.genlayer.com/tx/0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df
- Report route: `#/report/1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190`
- Local report, after starting EchoMap: http://127.0.0.1:5173/echomap/#/report/1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190

Existing receipt: FINALIZED / MAJORITY_AGREE / execution SUCCESS / disposition NEW. The unchanged decoder validated the actual return IDs. Actual sender, recipient, hash and assess calldata match the finalized Assessment. Canonical identifiers recomputed from that record match the actual request_id and payload_digest. `get_assessment` found=true using finalized reads, protocol/schema guards and existing onchain consistency verification.

## Actual semantic result, retained without retry
| Pair | Relation |
| --- | --- |
| A–B | DEPENDENT |
| A–C | INDEPENDENT |
| A–D | UNKNOWN |
| B–C | UNKNOWN |
| B–D | UNKNOWN |
| C–D | UNKNOWN |

PARTIAL; counts **1 DEPENDENT / 1 INDEPENDENT / 4 UNKNOWN**; maximum supported pairwise independent set **[A,C]**, indices[0,2], size2. B–C variation from the older controlled example is preserved. No result override, second submission or fixture modification.

## Actual network participation
1 exposed round; 0 leader rotations; configured initial validators5. Distinct successful participants3: one leader plus two agreeing validators. The leader appears twice in exposed execution entries but is counted once. Two validator entries are ERROR / idle and are not counted as successful. Full receipt, including those entries, is retained; this does not claim five successful participants.

## Evidence files / limitations
`evidence/real-wallet-e2e-receipt.json`: actual complete SDK-exposed receipt.
`evidence/real-wallet-e2e-finalized-assessment.json`: actual finalized record, including claim/context/URLs/read statuses/digests/relevance/pairs.
`evidence/real-wallet-e2e-participants.json`: address/role/execution/vote breakdown.
`evidence/real-wallet-e2e-read.log`: read-only assertions.
`evidence/phase6-closure-boundary.json`: immutable production-path proof.
`tests/verify-user-e2e-read.ts`: optional existing-transaction inspection script, never a write.

Post-patch discovery/selection tests are local mocked-provider/component checks, not another real wallet E2E. Both MetaMask and OKX have development test coverage; unknown compatible injected wallets are not individually verified. Real negative semantic controls remain NOT REAL-NETWORK VERIFIED. Recovery/429 work is deferred to separately authorized PHASE7. Local report URL requires the user's dev server; it is not a published Pages URL.

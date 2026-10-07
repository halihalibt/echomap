# EchoMap

EchoMap helps research collaborators and DAO reviewers map **source provenance and evidence independence** for one claim. Connect a compatible browser wallet, provide2–4 permitted public text documents, and share the finalized Evidence Independence Matrix report. It does not determine whether the claim is true.

GenLayer is the product's computation and shared-result layer:the frontend calls the existing EIM Intelligent Contract; participants independently bind source evidence and validate semantic labels. EchoMap displays fresh finalized chain records and checks deterministic consistency. It has no backend, database, indexer or second business contract.

**Canonical:**`0x7045b893E15B699e04494aA3849730bC6Aa1C864` · Stable Studionet61999 · EIM-V1-STUDIO. [Contract source/primitive](https://github.com/halihalibt/evidence-independence-matrix) · [Evidence index](EVIDENCE_INDEX.md).
**Public demo:** [Open EchoMap](https://halihalibt.github.io/echomap/). Public read-only smoke passed: homepage, canonical network/contract, both finalized examples, direct report reload, bilingual copy and no-wallet discovery guidance.

## User flow

Connect compatible injected wallet →enter claim/context/2–4supportedURLs →Assess evidence once →GenLayer consensus →successful FINALIZED receipt →matching finalized get_assessment →Shared Report. Accepted alone is not success. MAJORITY_DISAGREE or execution failure stays a failure, creates no successful report and never triggers automatic resubmission. Reports are wallet-free hash routes.

The homepage's **View Verified Onchain Example** opens the controlled **SYNTHETIC DEMO**; **Real Public Document Example** opens fixed ERC-20/IERC20 material. The manifest contains navigation coordinates only. Matrices/read statuses/relevance/digests/counts/max-set are read from the final canonical contract using LATEST_FINAL, not hardcoded fixture expectations. A consistency/protocol mismatch fails closed.

## Real evidence

- [Successful user wallet E2E](docs/REAL_WALLET_E2E_EVIDENCE.md):[0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df](https://explorer-studio.genlayer.com/tx/0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df);request `1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190`. FINALIZED/SUCCESS/MAJORITY_AGREE,found:true and actual Shared Report. Actual PARTIAL1D/1I/4U,max[A,C],size2; B-C UNKNOWN preserved.
- [Real multi-refresh recovery](docs/REAL_BROWSER_RECOVERY_EVIDENCE.md):[0x2915b28c0963aa42d026169e5181e93c3ff673ffa01e0485724e575aed4bf20d](https://explorer-studio.genlayer.com/tx/0x2915b28c0963aa42d026169e5181e93c3ff673ffa01e0485724e575aed4bf20d);same transaction/request/client_key after multiple user refreshes, no re-sign/duplicate write reported. Actual FINALIZED/MAJORITY_DISAGREE/Leader execution SUCCESS,found:false; correctly no successful report. This is failure-state recovery, not a successful assessment.
- [Public canonical examples](EVIDENCE_INDEX.md) provide independent controlled1D/2I/3U and real-document DEPENDENT records. Results from distinct requests are not rewritten to match each other.

## Wallet compatibility

Verified during development:MetaMask and OKX Wallet.
Compatibility:Other EIP-1193 /EIP-6963 compatible injected browser wallets may work, but were not individually verified. Actual discovered providers are listed dynamically and deduplicated; no brand allowlist and no guarantee for all EVM wallets. User explicitly selects/authorizes a provider; signing stays bound to that provider/account and chain61999.

## Reliability

One-write controller/no automatic write retry. Draft/key/identity/tx persist under local schema1. Refresh prioritizes saved tx and resumes wallet-free reads. Unknown submission without tx uses finalized creator/key lookup;found:false does not authorize another write. Success requires matching finalized receipt+record. One active poller per app runtime,5/10/15sbounded schedule, hidden-tab pause; wallet disconnect after submission does not prevent readonly tracking. Shared read scheduler serializes/coalesces reads, applies429 cooldown/Retry-After/reset and bounded read retries; wallet/write methods are excluded. Finalized read lag retries only reads.

These behavior guards have43 local focused cases. User multi-refresh/no-duplicate evidence is attested with screenshots; a real browser poller count/429 trace was not independently instrumented. Storage is origin-local, may be unavailable; no cross-tab/device lock. [Reliability details](docs/PHASE7_RELIABILITY.md).

## Run / tests / static publication

Exact Node24.19.0/npm11.9.0; React19.2.0/TypeScript5.9.3/Vite7.2.2/genlayer-js1.1.8. No env changes required.

```sh
npm ci
npm test
npm run build
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

127 local tests PASS in final packaging;strict production build PASS. Retained bundle-size warning is nonblocking. No new transaction/deployment during packaging. Existing PHASE6/8 evidence is preserved. [Exact frontend environment](docs/ENVIRONMENT_FRONTEND.md).

Static Pages is published from main,/docs: the verified build plus .nojekyll. Vite base/echomap/ and #/report routes need no server rewrite. [Publication checklist](PUBLISHING_CHECKLIST.md) records the successful public smoke. Source/evidence publication checkpoint: `9751035320fe81108d28fbf592b0f2265b499638`; later documentation commits preserve production source.

## Known limitations

Same visible-provenance/semantic/testnet limits as EIM.2–4bounded GitHub text sources only; no truth/hidden-origin authentication. Consensus may disagree; success not guaranteed. Real-model negative controls remain NOT REAL-NETWORK VERIFIED. Real browser brand/version was not established by cropped evidence. [Final limitations](KNOWN_LIMITATIONS.md) and [review path](REVIEWER_QUICK_PATH.md).

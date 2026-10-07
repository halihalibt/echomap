# Submission B — Projects

## Project and positioning

**Project name:** EchoMap.
**One-line description:** A static application for submitting an evidence pack, following GenLayer provenance consensus, and sharing a finalized independence matrix.
**Primary category:** Research and evidence collaboration application built on an Intelligent Contract.
**Target user:** Research collaborators, DAO reviewers, and people comparing public evidence sources.
**Publication status:** Final source/build/evidence are staged locally. Repository and Pages publication are BLOCKED; the intended demo is not yet a verified public URL.

## Problem and product flow

Several reports can repeat one original observation. EchoMap maps claim-scoped provenance relationships and shows a supported pairwise independent set. It does not determine whether a claim is true.

Connect a compatible injected browser wallet → enter a claim, context and 2–4 permitted URLs → assess once → GenLayer consensus → successful FINALIZED receipt → matching finalized Assessment → Shared Report. A failed consensus produces a failure terminal, no fabricated report and no automatic write retry. Public reports need no wallet.

## Why GenLayer is central

The existing Evidence Independence Matrix contract provides native source fetching, semantic validation and shared immutable results. The frontend reads accepted chain state rather than replacing it with a local prediction. The Leader generates the candidate; Validators independently reacquire/digest-bind evidence and verify each proposed relevance/pair label against rule-supported evidence anchors. EchoMap has no second business contract, backend, database or indexer. Repository A can be reused independently.

## Repository, demo, contract and source

- Repository B: https://github.com/halihalibt/echomap — intended; creation/publication not yet verified.
- Public demo: https://halihalibt.github.io/echomap/ — intended; NOT PUBLISHED / NOT VERIFIED.
- Canonical contract: `0x7045b893E15B699e04494aA3849730bC6Aa1C864`.
- Network: Stable Studionet, Chain ID 61999.
- Protocol: EIM-V1-STUDIO; schema EIM-CANDIDATE-V1; consensus revision ACR-001-SAFETY-1.
- Contract source repository: https://github.com/halihalibt/evidence-independence-matrix.
- Deployment source commit: `4874fd469cb5477b9d8f8ec9dbc19252a6112e6e`; production file SHA256 `121deb7f9a2a0ae4c7704e96d74b3678054ccd2dbed77ff7e3373fa75749c095`. The Git bundle preserves the local source commit; remote final-source publication remains pending.
- Frontend production baseline: a6da8809c4330f4dd43de773a67862a24a7f2c1b; closure checkpoint d6b4a5d41299f0b920f4b1d002e431890582d0d0. Final remote publication commit is not yet available.

## Verified onchain examples

Homepage entries distinguish SYNTHETIC DEMO from REAL PUBLIC DOCUMENT EXAMPLE. The manifest stores navigation coordinates only; every displayed Assessment is a fresh LATEST_FINAL read from the canonical contract.

Controlled request `68b9090d638738bd0236b084aff95ae7551d8df11da9b282aaa536ecd448258f`, creation transaction `0xec875a1a5de724b7fd6a407e851ba736393ae508f330c1b94059c9f72191d7f4`: actual PARTIAL, 1 DEPENDENT /2 INDEPENDENT /3 UNKNOWN, maximum set [A,C], size2.

Real public-document request `5c8aae111e19f6b193d5a8b4b8dce4697f424166922cd2116b49343b620c7b46`, creation transaction `0x77ddb362ff4fa11dc9a827de14f143da266c3c9c82d018950c9fc9376b45f4bb`: fixed ERC-20 specification and OpenZeppelin IERC20; actual DEPENDENT /COMPLETE. Public hash-report routes remain pending publication.

## Real successful wallet E2E

[Transaction 0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df](https://explorer-studio.genlayer.com/tx/0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df).
Request `1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190`.

The user completed browser wallet → EchoMap assess → Stable consensus → MAJORITY_AGREE /SUCCESS /FINALIZED → found:true finalized Assessment → Shared Report. Actual PARTIAL, 1 DEPENDENT /1 INDEPENDENT /4 UNKNOWN, [A,C], size2 is preserved, including B–C UNKNOWN. Three distinct successful participants were exposed. The cropped screenshots do not establish the particular wallet brand.

## Real recovery and reliability

[Recovery transaction](https://explorer-studio.genlayer.com/tx/0x2915b28c0963aa42d026169e5181e93c3ff673ffa01e0485724e575aed4bf20d): `0x2915b28c0963aa42d026169e5181e93c3ff673ffa01e0485724e575aed4bf20d`.
Request `8bcc1dcb3ba13df648d68b9e81d01c2257695265c988a91cd5978d414076f350`.

The user confirmed multiple Pending/Committing refreshes kept the same transaction/request/client key/contract, with no new signature, second write or key. Final result was FINALIZED /MAJORITY_DISAGREE /Leader execution SUCCESS, found:false. EchoMap correctly displayed a failed terminal without a successful report. Screenshots, user attestation and four read-only calls corroborate this. It is failure recovery, not a successful assessment; no HAR or independent real-runtime poller measurement was supplied.

One-write controller, no automatic write retry, persistent current request, one poller per runtime, hidden-tab pause, shared429 cooldown/Retry-After, bounded read retries and wallet-free recovery are documented. Finalized read lag retries only the getter. Local127 tests and production build pass; existing bundle warning is retained. Packaging sent no transaction or deployment and spent no cash.

## Wallet compatibility

Verified during development: MetaMask and OKX Wallet. Other EIP-1193 /EIP-6963 compatible injected browser wallets may work, but were not individually verified. Actual providers are dynamically discovered; there is no all-wallet guarantee. Selected provider/account, canonical recipient and Chain ID61999 remain bound throughout signing.

## How to test / reviewer quick path

After publication: open the homepage → view the verified example without a wallet → inspect matrix, digests, UNKNOWN and maximum set → open the real-document example → direct-load and refresh a shared hash-report route → inspect distinct successful-wallet and failure-recovery evidence. No new assessment is needed to review. README includes exact build/test commands; PUBLISHING_CHECKLIST.md records the pending public browser smoke.

## Tests and known limitations

127 local tests PASS,0 failures/skips, production build PASS. Provider/error cases are mocked; real-model negative controls are NOT REAL-NETWORK VERIFIED. Visible source declarations may omit or fabricate origins, semantic outputs can vary and consensus can fail. Only2–4 bounded GitHub text sources are supported. Browser recovery is origin-local with no cross-tab lock. Pages/public-link smoke remains BLOCKED until actual publication. No Portal or social submission has been performed.

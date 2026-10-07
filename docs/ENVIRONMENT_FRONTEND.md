# PHASE 5 frontend environment

Authority: approved Freeze + approved ACR-001/safety patch; WORK_HANDOFF_PACKAGE_V1; unchanged ENVIRONMENT_LOCK; Phase 4 final closure. Frontend package versions were not previously selected in the lock and are pinned here at the first authorized frontend install. No network, SDK or contract-family change.

| Component | Exact version |
| --- | --- |
| Node / npm | 24.19.0 / 11.9.0 |
| React / react-dom | 19.2.0 / 19.2.0 |
| TypeScript | 5.9.3 |
| Vite | 7.2.2 |
| genlayer-js / viem | 1.1.8 / 2.57.3 |
| tsx | 4.20.6 |
| React / react-dom typings | 19.2.2 / 19.2.2 |

Official registry metadata and exact install verified; package-lock.json fixes transitive resolution. No `latest` dependency specifications. Node built-in test runner plus tsx; no new browser/E2E framework.

SDK adapter: `createClient({chain:studionet})`, readContract with `TransactionHashVariant.LATEST_FINAL`, no account/provider/signing. The transport sends `gen_call` with `type:read` / `transaction_hash_variant:latest-final`. Business protocol EIM-V1-STUDIO; schema EIM-CANDIDATE-V1; final deployment manifest consensus revision ACR-001-SAFETY-1. The protocol read exposes business/schema/rules identifiers, not that manifest-only consensus revision.

No faucet operation, new GEN spending, transaction or deployment occurred in PHASE 5.

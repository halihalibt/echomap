# WALLET_DISCOVERY_UX_PATCH

Updated UTC: 2026-10-07T12:32:22.386241+00:00

## Gate: PASS
Only discovery, deduplication, selection UI and associated tests/copy/documentation changed. No new dependency, wallet framework, WalletConnect or state system.

## Behavior
Initial disconnected UI shows Connect Wallet. Zero providers: disabled Connect plus generic compatible-wallet install/enable guidance. One provider: user click passes that exact choice to existing connection logic. Multiple: user click opens Choose a wallet; only discovered providers are listed. No permanent brand dropdown or hardcoded wallet allowlist.

EIP6963 uses compatible request-bearing providers and advertised name/rdns/UUID. Legacy EIP1193/window.ethereum remains available for unannounced wallets, including unknown brands. Known MetaMask/OKX flags identify only legacy names/families, not admission permissions. Aggregate `ethereum.providers` is traversed without treating the aggregate itself as a second wallet. Invalid announcements are ignored without connecting.

Deduplication: exact provider object identity; repeated EIP6963 rdns+UUID; recognized legacy wallet family (OKX rdns aliases normalized). Announced metadata replaces a duplicate legacy entry. Two distinct announced UUIDs may remain separately selectable, with their identifiers shown when names coincide. No ordinary (2)/(3) suffixes. Unidentifiable distinct generic legacy objects cannot safely be assumed identical; metadata discovery is preferred. Wallet metadata is self-advertised, not a trusted identity attestation.

Late discoveries never mutate a previously bound choice/provider. Selection directly passes the exact object to the existing WalletSession; no state-update race or silent switching. WalletSession class is byte-identical. Network/account/revision binding, guard, one-write controller, request IDs, canonical contract, signing/fees, transaction tracking, finality and report reads are unchanged.

## Tests / build
84 tests PASS /0 failures: all original40 PHASE5 and30 PHASE6 definitions retained byte-for-byte, plus14 focused discovery/selection tests. Covers0/1/multi, MetaMask+OKX, unknown announced/legacy wallets, repeated metadata, EIP+legacy same-object/family dedup, legacy wrappers, aggregate exclusion, distinct UUIDs, initial UI, user-action-only discovery and selected-provider binding through preparation. Existing account/network/write safety coverage remains intact.

Production TS/Vite build PASS. Existing large SDK bundle warning retained (~763kB); no refactor to suppress it. Initial closure checks passed83 tests before one additional legacy-wrapper dedup case; final required verification passed84. Temporary shell path mistakes created no production files and were corrected; no test removed or weakened.

## Protected boundary
Unchanged hashes: controller.ts, transactions.ts, genlayer.ts, core.ts, lifecycle.ts, types.ts, deployment.json, package-lock.json, foundation.test.ts. Original write.test.ts also unchanged. WalletSession and App submit/fresh/report/read paths unchanged. Repository A baseline and Freeze SHA unchanged. See `evidence/phase6-closure-boundary.json`.

## Real evidence / scope
REAL WALLET E2E VERIFIED BEFORE UX PATCH.
UX PATCH DID NOT CHANGE TRANSACTION SEMANTICS.
The existing `0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df` transaction and finalized report remain valid. No post-patch wallet E2E or transaction was sent. No guarantee that every injected wallet works; MetaMask and OKX are Verified during development, other EIP1193/EIP6963 compatible injected wallets may work but were not individually verified.

No ACR; no HIGH complexity; no contract/deployment/API/schema changes. PHASE7 NOT_STARTED / NOT_AUTHORIZED. Stop.

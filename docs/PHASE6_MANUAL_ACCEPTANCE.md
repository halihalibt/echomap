# PHASE6_MANUAL_ACCEPTANCE

## PASS / CLOSED
The user has completed the single authorized real wallet E2E. **Do not repeat it or send another transaction.** This file replaces the pending-action checklist; the original checklist is preserved in CONTROL/evidence/phase6/PRE_UX_PHASE6_MANUAL_ACCEPTANCE.md.

Network Stable Studionet /61999; canonical `0x7045b893E15B699e04494aA3849730bC6Aa1C864`.
Transaction `0xc36631f831424a6edb897c41261cb859ef9ed88bcf447583d5a609be07fbc7df`; request `1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190`.
Actual receipt FINALIZED / SUCCESS / MAJORITY_AGREE / NEW. Finalized get_assessment found=true; expected/actual request IDs match; Shared Report opened and displays actual1D/1I/4U, PARTIAL, [A,C], size2. User screenshots and read-only validation are retained in REAL_WALLET_E2E_EVIDENCE.md and evidence/.

REAL WALLET E2E VERIFIED BEFORE UX PATCH.
UX PATCH DID NOT CHANGE TRANSACTION SEMANTICS.

## Read-only review, without wallet or submission
1. Extract the closure source package. Open its echomap directory in a terminal.
2. Run `npm install`, then `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` (or existing START_WINDOWS.cmd). No environment variables or code changes required.
3. Open http://127.0.0.1:5173/echomap/#/report/1a881569aa32902b46025cbf81817ddca529467fba23df079a5b5134af619190 . This route reads the finalized canonical record; it does not submit.
4. Preserve B–C UNKNOWN. Do not click Assess, New Assessment, or send another NEW to reproduce a preferred matrix.

## Final wallet UI behavior (locally verified)
Start screen shows Connect Wallet. One discovered provider connects on click; multiple providers open Choose a wallet on click. Only installed/announced compatible wallets are listed. No-wallet guidance is generic. Selected provider stays bound through the existing preparation/signing flow.

Verified during development: MetaMask, OKX Wallet.
Compatibility: Other EIP-1193 / EIP-6963 compatible injected browser wallets may work, but were not individually verified.

No fresh signing, funded-account test, faucet claim or recovery test is requested. Persistent recovery and429 work belong to PHASE7 after separate authorization.

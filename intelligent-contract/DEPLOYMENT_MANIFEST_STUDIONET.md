# Final canonical deployment

| Field | Actual value |
|---|---|
| Network / Chain ID |Stable Studionet /61999|
| Canonical contract |`0x7045b893E15B699e04494aA3849730bC6Aa1C864`|
| Protocol / schema |EIM-V1-STUDIO /EIM-CANDIDATE-V1|
| Consensus revision |ACR-001-SAFETY-1|
| Deployment source commit |`4874fd469cb5477b9d8f8ec9dbc19252a6112e6e`|
| Production file SHA256 |`121deb7f9a2a0ae4c7704e96d74b3678054ccd2dbed77ff7e3373fa75749c095`|
| Deployment transaction |[0x2486995a27e99c7d3bd1da857e9af39b330eb2092f066edb780aa44caacd3007](https://explorer-studio.genlayer.com/tx/0x2486995a27e99c7d3bd1da857e9af39b330eb2092f066edb780aa44caacd3007)|
| Deployment result |FINALIZED /SUCCESS /MAJORITY_AGREE|
| RPC |https://studio.genlayer.com/api|
| SDK / GenVM / tests |genlayer-js1.1.8 /GenVM v0.2.16 /genlayer-test0.29.2|
| Depends |py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6|
| Publication status |Public source/evidence checkpoint a54a4fde7a6d601de0ef470687e1104e0eb989cc; unchanged canonical file verified byte-for-byte. Later documentation publication is distinct from deployment source commit.|

The immutable deployed source commit is preserved in [canonical Git bundle](https://github.com/halihalibt/evidence-independence-matrix/blob/a54a4fde7a6d601de0ef470687e1104e0eb989cc/deployment/canonical-source.bundle); the checked-in production file matches its SHA256. A later documentation/publication commit is distinct from the deployment source commit. Business protocol/IDs retain EIM-V1-STUDIO; consensus revision, source hash and contract address distinguish the approved safety implementation. [Full manifest](https://github.com/halihalibt/evidence-independence-matrix/blob/a54a4fde7a6d601de0ef470687e1104e0eb989cc/deployment/canonical.json) and [network evidence](https://github.com/halihalibt/evidence-independence-matrix/blob/a54a4fde7a6d601de0ef470687e1104e0eb989cc/ONCHAIN_EVIDENCE.md).

## Superseded diagnostic deployments

Old0x6Dbde095C83a68B7932f7dE80Ba0642043F5Ce03 and intermediate0xbA3F0E8E45caF7665F0532313021Bb1B93b3c6eC are historical diagnostics only. Never use them as a canonical alternative/fallback. Historical receipts/manifests/approved ACR files remain preserved; no migration or redeployment performed in publication.

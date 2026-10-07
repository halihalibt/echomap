# Canonical source provenance

Canonical Intelligent Contract: **Evidence Independence Matrix**.

- Canonical address: `0x7045b893E15B699e04494aA3849730bC6Aa1C864`
- Network: Stable Studionet
- Chain ID: 61999
- Protocol: EIM-V1-STUDIO
- Schema: EIM-CANDIDATE-V1
- Consensus revision: ACR-001-SAFETY-1
- Canonical source repository: https://github.com/halihalibt/evidence-independence-matrix
- Public immutable source checkpoint: `a54a4fde7a6d601de0ef470687e1104e0eb989cc`
- Deployment source commit: `4874fd469cb5477b9d8f8ec9dbc19252a6112e6e`
- Production source SHA256: `121deb7f9a2a0ae4c7704e96d74b3678054ccd2dbed77ff7e3373fa75749c095`

[Complete embedded source](contracts/evidence_independence_matrix.py) is a byte-for-byte review copy of Repository A's `contracts/evidence_independence_matrix.py`, including comments. It exists so Projects reviewers can audit the complete Intelligent Contract without leaving Repository B. It is the same canonical Intelligent Contract, not a second deployment. EchoMap calls its deployed address through genlayer-js; Repository A remains the standalone Intelligent Contracts submission.

[Immutable upstream file](https://github.com/halihalibt/evidence-independence-matrix/blob/a54a4fde7a6d601de0ef470687e1104e0eb989cc/contracts/evidence_independence_matrix.py). The public source checkpoint and later publication commits are distinct from the deployment source commit.

## Submission URL separation

- Submission A / Intelligent Contracts primary repository: https://github.com/halihalibt/evidence-independence-matrix
- Submission B / Projects primary repository: https://github.com/halihalibt/echomap
- Submission B public demo: https://halihalibt.github.io/echomap/

Repository A's URL is not required as the Projects repository URL. Portal duplicate-URL avoidance will be handled separately during submission. No Portal submission is performed by this patch.

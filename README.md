---
title: VeriChain API
emoji: 🔗
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# VeriChain — Autonomous AI Due-Diligence Infrastructure for Real World Assets

VeriChain is AI-powered trust infrastructure for Real World Assets (RWAs). Users
upload real-estate documents; five specialized AI agents analyze them, detect
inconsistencies and fraud indicators, compute a composite risk score, and write a
tamper-proof verification proof to the Mantle blockchain — *before* the asset is
tokenized.

Built for the **Mantle Turing Test Hackathon 2026**.

- **Live app:** https://veri-chain-client.vercel.app
- **Backend API:** https://chinkinss-verichain.hf.space
- **Verified contract:** https://sepolia.mantlescan.xyz/address/0x743e1166EEFa6b8ec22C077231f93a464F4a34E3#code
- **Network:** Mantle Sepolia Testnet (chain ID `5003`)

---

## Table of Contents

- [The Problem](#the-problem)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Contract Addresses](#contract-addresses)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Smart Contracts (Foundry)](#smart-contracts-foundry)
- [ERC-8004 Agent Identities](#erc-8004-agent-identities)
- [API Reference](#api-reference)
- [How the Verification Pipeline Works](#how-the-verification-pipeline-works)
- [License](#license)

---

## The Problem

Tokenizing a real-world asset like real estate today means uploading a document
and asking investors to trust it. There is no automated, objective system that
checks whether that document is genuine, complete, and fraud-free before it
becomes a tradable on-chain token. Investors have no verifiable risk data,
regulators have no audit trail, and nothing stops the same asset from being
tokenized twice.

VeriChain is the verification layer that sits *before* tokenization.

---

## Key Features

- **Five specialized AI agents** — Metadata, Ownership, Compliance, Fraud
  Detection, and Risk Scoring, each producing an independent, measurable result
  with a detailed written explanation.
- **Hybrid verification** — a deterministic rule engine runs first and cannot be
  overridden by AI, so hallucination can never unilaterally decide fraud. AI adds
  reasoning, anomaly explanations, and compliance interpretation on top.
- **On-chain proofs on Mantle** — document hash, risk score, status, and a hash
  of all agent outputs are written to the `VeriChainRegistry` contract.
- **Contract-level double-tokenization prevention** — the contract enforces one
  proof per document hash; re-verifying an already-proven asset is rejected
  on-chain, where it cannot be bypassed.
- **ERC-8004 agent identities** — each agent is registered as an on-chain identity
  NFT on the official ERC-8004 Identity Registry on Mantle.
- **Radical transparency** — per-agent scores, raised flags, reasoning, execution
  times, and a clickable on-chain audit trail are all surfaced in the UI.

---

## Architecture

```
                          ┌──────────────────────────────┐
                          │          Frontend             │
                          │  React + Vite + TS (Vercel)   │
                          │                                │
                          │  Landing / Dashboard /         │
                          │  Explorer / Agent Reputation   │
                          └───────┬───────────────┬────────┘
                                  │               │
              AI services (REST)  │               │  Wallet (wagmi / viem)
                                  │               │  signs transactions
                                  ▼               ▼
              ┌────────────────────────┐   ┌──────────────────────────┐
              │   Backend API (HF)     │   │   Mantle Sepolia (5003)   │
              │  Node + Express + TS   │   │                           │
              │                        │   │  • VeriChainRegistry      │
              │  • OCR (Tesseract /    │   │    (verification proofs)  │
              │    pdf-parse)          │   │  • ERC-8004 Identity      │
              │  • Rule engine         │   │    Registry (agent NFTs)  │
              │  • 5 AI agents         │   └──────────────────────────┘
              │  • Risk aggregation    │
              └───────────┬────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   MongoDB     │
                   │  documents,   │
                   │ verifications,│
                   │  agent_logs   │
                   └──────────────┘
```

**Architecture rule:** the frontend talks directly to the smart contracts for all
on-chain writes (the user's wallet signs). The backend never controls blockchain
transactions — it handles OCR, AI agent orchestration, deterministic validation,
risk scoring, and MongoDB persistence.

A rendered diagram is available in [`docs/architecture.svg`](docs/architecture.svg).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts, wagmi, viem, RainbowKit |
| Backend | Node.js, Express (MVC), TypeScript, Mongoose |
| Database | MongoDB |
| Blockchain | Solidity, Foundry, Mantle Network |
| AI | Multi-agent pipeline via OpenRouter |
| OCR | Tesseract.js, pdf-parse |

---

## Contract Addresses

> Mantle Sepolia Testnet — chain ID `5003`

| Contract | Address |
|---|---|
| VeriChainRegistry (verification proofs) | [`0x743e1166EEFa6b8ec22C077231f93a464F4a34E3`](https://sepolia.mantlescan.xyz/address/0x743e1166EEFa6b8ec22C077231f93a464F4a34E3#code) ✅ Verified |
| ERC-8004 Identity Registry (official) | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ERC-8004 Reputation Registry (official) | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |

> ⚠️ The same `VeriChainRegistry` address must be set in both the backend
> (`VERICHAIN_CONTRACT_ADDRESS`) and the frontend (`VITE_CONTRACT_ADDRESS`).

Explorer: https://sepolia.mantlescan.xyz

---

## Local Setup

### Prerequisites

- Node.js 20+
- MongoDB connection string (Atlas or local)
- OpenRouter API key (https://openrouter.ai — free models available)
- Foundry (for contracts) — https://getfoundry.sh
- A funded Mantle Sepolia wallet (test MNT from a faucet)

### Install

```bash
git clone https://github.com/SirArlex/VeriChain.git
cd VeriChain
npm run install:all
```

### Configure

Create the env files described in [Environment Variables](#environment-variables).

### Run (development)

```bash
# starts both client and server concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Build (production)

```bash
npm run build
```

---

## Environment Variables

**Backend** (`server/.env`)

```
NODE_ENV=development
PORT=3001
MONGODB_URI=<your mongodb connection string>
OPENROUTER_API_KEY=<your openrouter key>
OPENROUTER_MODEL=openai/gpt-4o-mini
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
MANTLE_CHAIN_ID=5003
VERICHAIN_CONTRACT_ADDRESS=0x743e1166EEFa6b8ec22C077231f93a464F4a34E3
```

**Frontend** (`client/.env`)

```
VITE_API_URL=https://chinkinss-verichain.hf.space
VITE_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
VITE_MANTLE_CHAIN_ID=5003
VITE_CONTRACT_ADDRESS=0x743e1166EEFa6b8ec22C077231f93a464F4a34E3
VITE_WALLETCONNECT_PROJECT_ID=<get a free project id at https://cloud.reown.com>
```

**Contracts** (`contracts/.env`)

```
DEPLOYER_PRIVATE_KEY=<deployer wallet key>
```

> Never commit `.env` files. They are git-ignored by default.

---

## Smart Contracts (Foundry)

```bash
cd contracts
forge build
forge test
```

### Deploy to Mantle Sepolia

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast --legacy
```

### VeriChainRegistry interface

| Function | Description |
|---|---|
| `storeVerification(...)` | Writes a verification proof (document hash, risk score, status, agent outputs) on-chain. Reverts if the document already has a proof. |
| `isDocumentVerified(documentHash)` | Returns true if a document already has an on-chain proof. |
| `getVerification(verificationId)` | Reads a stored proof. |
| `getDocumentVerifications(documentHash)` | All verifications for a document. |
| `getSubmitterVerifications(submitter)` | All verifications by an address. |

Emits `VerificationStored` on each write.

---

## ERC-8004 Agent Identities

VeriChain's five agents are registered against the **official** ERC-8004 Identity
Registry on Mantle (no custom fork). Each agent is minted an ERC-721 identity NFT.

| Agent | agentId |
|---|---|
| Metadata | 108 |
| Ownership | 109 |
| Compliance | 110 |
| Fraud Detection | 111 |
| Risk Scoring | 112 |

Registration script: `contracts/script/RegisterAgents.s.sol`. Agent registration
files are served at `/agents/<slug>.json`. The Agent Reputation page links each
agent to its on-chain identity on the explorer.

---

## API Reference

Base URL: `https://chinkinss-verichain.hf.space/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/documents/upload` | Upload a document; runs OCR + persistence |
| `GET` | `/documents` | List documents |
| `GET` | `/documents/:documentId` | Get a document |
| `POST` | `/verifications/start` | Run the full AI verification pipeline |
| `GET` | `/verifications` | List verifications |
| `GET` | `/verifications/:verificationId` | Get a verification |
| `GET` | `/verifications/document/:documentId` | Verifications for a document |
| `PATCH` | `/verifications/:verificationId/onchain` | Record on-chain tx hash |
| `GET` | `/agents/reputation` | Agent reputation scores |
| `GET` | `/agents/stats` | Aggregate agent stats |

---

## How the Verification Pipeline Works

```
Upload document
  → OCR / PDF text extraction
  → Deterministic rule engine (dates, ownership, duplicates, metadata)
  → 5 AI agents run (reasoning + scoring via OpenRouter)
  → Risk aggregation (composite score + risk level)
  → MongoDB persistence (documents, verifications, agent_logs)
  → Result returned to UI
  → Verification proof written on-chain (Mantle) automatically when a wallet is connected
  → Re-tokenization of an already-verified document is blocked at the contract level
```

AI provides reasoning, anomaly explanations, compliance summaries, and fraud
interpretation. It does not unilaterally decide fraud — deterministic checks run
first and the Risk Scoring agent aggregates everything into the final weighted
verdict.

---

## License

MIT

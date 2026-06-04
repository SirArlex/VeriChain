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
inconsistencies and fraud indicators, compute a composite risk score, and store
a tamper-proof verification proof on the Mantle blockchain before tokenization.

Built for the **Mantle Turing Test Hackathon 2026**.

- **Live app:** https://veri-chain-client.vercel.app
- **Backend API:** https://chinkinss-verichain.hf.space
- **Network:** Mantle Sepolia Testnet (chain ID `5003`)

---

## Table of Contents

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

---

## Key Features

- **Five specialized AI agents** — Metadata, Ownership, Compliance, Fraud
  Detection, and Risk Scoring, each producing an independent, measurable result.
- **Hybrid verification** — deterministic rule engine + Google Gemini reasoning,
  so the AI explains and interprets but does not unilaterally decide fraud.
- **On-chain proofs on Mantle** — document hash, risk score, status, and agent
  outputs are written to the `VeriChainRegistry` contract.
- **ERC-8004 agent identities** — each agent is registered as an on-chain
  identity NFT on the official ERC-8004 Identity Registry on Mantle.
- **Full transparency** — per-agent scores, raised flags, reasoning, execution
  times, and a clickable on-chain audit trail are all surfaced in the UI.

---

## Architecture

```
                          ┌──────────────────────────────┐
                          │          Frontend             │
                          │  React + Vite + TS (Vercel)   │
                          │                                │
                          │  • Landing / Dashboard         │
                          │  • Explorer / Agent Reputation │
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
              │  • Gemini integration  │
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

**Architecture rule:** the frontend talks directly to smart contracts for all
on-chain writes (the user's wallet signs). The backend never controls blockchain
transactions — it handles OCR, Gemini calls, deterministic validation, risk
scoring, agent orchestration, and MongoDB persistence.

A rendered diagram is available in [`docs/architecture.svg`](docs/architecture.svg).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript, TailwindCSS, Framer Motion, Recharts, wagmi, viem, RainbowKit |
| Backend | Node.js, Express (MVC), TypeScript, Mongoose |
| Database | MongoDB |
| Blockchain | Solidity, Foundry, Mantle Network |
| AI | Google Gemini |
| OCR | Tesseract.js, pdf-parse |

---

## Contract Addresses

> Mantle Sepolia Testnet — chain ID `5003`

| Contract | Address |
|---|---|
| VeriChainRegistry (verification proofs) | `0x9A10454a5a40A85Cc8db2e6BDbEf1e9e0E9A8b39` |
| ERC-8004 Identity Registry (official) | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ERC-8004 Reputation Registry (official) | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |

> ⚠️ Set the **same** `VeriChainRegistry` address in both the backend
> (`VERICHAIN_CONTRACT_ADDRESS`) and the frontend (`VITE_CONTRACT_ADDRESS`).

Explorer: https://sepolia.mantlescan.xyz

---

## Local Setup

### Prerequisites

- Node.js 20+
- MongoDB connection string (Atlas or local)
- Google Gemini API key
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
GEMINI_API_KEY=<your gemini key>
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
MANTLE_CHAIN_ID=5003
VERICHAIN_CONTRACT_ADDRESS=<your VeriChainRegistry address>
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

### Verify on Mantle Explorer

```bash
forge verify-contract <ADDRESS> \
  src/VeriChainRegistry.sol:VeriChainRegistry \
  --chain 5003 \
  --verifier blockscout \
  --verifier-url https://explorer.sepolia.mantle.xyz/api \
  --compiler-version 0.8.24 \
  --num-of-optimizations 200
```

### VeriChainRegistry interface

| Function | Description |
|---|---|
| `storeVerification(...)` | Writes a verification proof (document hash, risk score, status, agent outputs) on-chain |
| `getVerification(verificationId)` | Reads a stored proof |
| `getDocumentVerifications(documentHash)` | All verifications for a document |
| `getSubmitterVerifications(submitter)` | All verifications by an address |
| `verificationExists(verificationId)` | Existence check |

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
  → 5 AI agents run (Gemini-backed reasoning + scoring)
  → Risk aggregation (composite score + risk level)
  → MongoDB persistence (documents, verifications, agent_logs)
  → Result returned to UI
  → Verification proof written on-chain (Mantle) automatically when a wallet is connected
```

Gemini provides reasoning, anomaly explanations, compliance summaries, and fraud
interpretation. It does not unilaterally decide fraud — deterministic checks run
first and the Risk Scoring agent aggregates everything into the final verdict.

---

## License

MIT

# AGORA

**Crowd-sourced, AI-verified knowledge database on GenLayer.**

Submit research. AI validators verify it against the source. Earn reputation. Every entry lives on-chain — permanent, auditable, real.

**Live:** [agora-v1.vercel.app](https://agora-v1.vercel.app)

---

## How it works

1. **Submit** — Write a summary of something you found. Paste the source URL. Pick a topic.
2. **Validate** — GenLayer validators independently fetch your source. AI scores your summary across four dimensions: accuracy, relevance, quality, and novelty.
3. **Earn** — High-quality entries earn reputation. Verified tier (80–100) doubles your reward. Rejected entries earn nothing.

## Features

- **AI-verified entries** — Every submission is scored by AI validators who independently fetch and evaluate the source material
- **Quality tiers** — Verified (80–100, 2x reward), Accepted (50–79, 1x reward), Rejected (0–49, no reward)
- **Bounties** — Post research questions with a minimum quality threshold. Anyone can claim by submitting a verified entry
- **Challenges** — Dispute an existing entry. AI re-evaluates with your objection. Valid challenges earn reputation
- **Leaderboard** — Contributor rankings by reputation, entries, verifications, and challenges won
- **On-chain transparency** — Every entry, score, and reputation change is recorded on GenLayer. The contract is public and auditable

## Tech stack

| Layer | Technology |
|-------|-----------|
| Contract | GenLayer Intelligent Contract (Python) |
| Frontend | Next.js 16, React 19, Tailwind v4 |
| Auth | Firebase Auth (email + injected wallet) |
| API | Express on Railway |
| Chain | GenLayer Studionet (Chain 61999) |
| Design | Ferrari-inspired system — Rosso Corsa, sharp corners, uppercase CTAs |

## Contract

- **Address:** `0xDeBa41B6873088b9c82e85c3c272371D54F69347`
- **Network:** GenLayer Studionet
- **View in Studio:** [GenLayer Studio](https://studio.genlayer.com/?import-contract=0xDeBa41B6873088b9c82e85c3c272371D54F69347)

## Validation methodology

Validators use `gl.eq_principle.prompt_comparative` for consensus:

1. **Source fetch** — Validators independently fetch the source URL
2. **AI evaluation** — Each validator's AI scores the summary across accuracy, relevance, quality, and novelty (0–100 each)
3. **Consensus** — Validators must agree on the verdict and overall score within 15 points
4. **On-chain record** — The accepted result is stored permanently with full auditability

## Project structure

```
Agora/
├── contracts/
│   └── agora.py          # GenLayer Intelligent Contract
├── api/
│   └── src/              # Express API (Firebase Auth + wallet management)
└── web/
    ├── app/              # Next.js pages (explore, submit, bounties, leaderboard, etc.)
    ├── components/       # Logo, NavClient
    └── lib/              # Config, types, wallet provider, contract helpers
```

## Local development

```bash
# API
cd api
cp .env.Example .env     # fill in Firebase Admin + wallet encryption key
npm install && npm run dev

# Frontend
cd web
cp .env.Example .env.local  # fill in Firebase web config + API URL
npm install && npm run dev
```

## Environment variables

**Frontend (`web/.env.local`):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

**API (`api/.env`):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `WALLET_ENCRYPTION_KEY`
- `PORT`

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
- **Bonded appeals** — If your entry is downgraded by a challenge, stake 20 reputation for a fresh, independent re-ruling. Win → entry, reputation, and bond restored and the challenger's reward reversed. Lose → the challenge stands and the bond goes to the challenger
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

- **Address:** `0x88865683016C574Cb6fa48940E083A483c3c3A88`
- **Network:** GenLayer Studionet
- **View in Studio:** [GenLayer Studio](https://studio.genlayer.com/?import-contract=0x88865683016C574Cb6fa48940E083A483c3c3A88)

## Validation methodology

Validators use `gl.eq_principle.prompt_comparative` for consensus:

1. **Source fetch** — Validators independently fetch the source URL
2. **AI evaluation** — Each validator's AI scores the summary across accuracy, relevance, quality, and novelty (0–100 each)
3. **Consensus** — Validators must agree on the verdict and overall score within 15 points
4. **On-chain record** — The accepted result is stored permanently with full auditability

### Challenge fail-safe

Upholding a challenge downgrades an entry, rewards the challenger, and strips the
author's reputation — so an unreachable source must never be mistaken for grounds to
uphold one. The arbitrator computes source reachability deterministically, agrees it
in the consensus principle, and a contract-side backstop forces the challenge invalid
whenever the source could not be fetched. A temporarily-down source can never strip a
good entry or let a griefer farm reputation. **On doubt, the entry stands.**

### Appeals

An upheld challenge is the one adverse ruling in Agora with teeth — it downgrades the
entry and moves reputation — so the author gets recourse. `appeal_challenge` lets the
author stake a **20-reputation bond** for a fresh, independent second-panel ruling on
the same objection (re-fetch + independent judgement, and it inherits the same
unreachable-source fail-safe, so an appeal on a dead source always restores the entry):

- **Overturned** → the entry's score, tier, verdict, and `active` status are restored, the
  reputation the challenge deducted is returned, the bond is refunded, and the challenger's
  reward is reversed.
- **Denied** → the challenge stands and the bond is forfeited to the challenger.

The bond is native reputation (Agora holds no GEN — reputation *is* the currency), which
keeps frivolous appeals costly while making a justified one whole. One appeal per upheld
challenge.

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

## Signed writes

Contract writes are signed by the **connected wallet's own EIP-1193 provider** — the
wallet context builds the genlayer-js client with `createClient({ chain, account,
provider })` and every write routes through it. A repository-level test
(`web/tests/signed-write.test.ts`) proves the write path routes `eth_sendTransaction`
through that provider with the correct `from`.

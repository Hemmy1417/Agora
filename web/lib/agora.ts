// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = any;

import { createClient } from "genlayer-js";
import { ethers } from "ethers";
import { CHAIN, CONTRACT_ADDRESS } from "./config";
import type { Entry, Topic, Profile, Bounty, Stats } from "./types";

function checksum(a: string): string {
  try { return ethers.getAddress(a); } catch { return a; }
}

function isTransient(msg: string): boolean {
  const l = msg.toLowerCase();
  return l.includes("failed to fetch") || l.includes("rate") || l.includes("network")
      || l.includes("timeout") || l.includes("503") || l.includes("502");
}

async function sleep(ms: number) { await new Promise(r => setTimeout(r, ms)); }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function read(method: string, params: any[] = []): Promise<unknown> {
  const client = createClient({ chain: CHAIN });
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      return await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: method,
        args: params,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (isTransient(msg) && attempt < 5) {
        console.warn(`[AGORA] read ${method} attempt ${attempt} failed, retrying…`);
        await sleep(1000 * attempt);
        continue;
      }
      throw e;
    }
  }
}

export async function writeAndWait(
  client: Client,
  method: string,
  params: unknown[]
): Promise<string> {
  console.log("[AGORA] writeContract →", method, params);

  let hash: string | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: method,
        args: params,
      });
      break;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (isTransient(msg) && attempt < 3) {
        console.warn(`[AGORA] writeContract attempt ${attempt} failed, retrying…`);
        await sleep(2000 * attempt);
        continue;
      }
      throw e;
    }
  }
  if (!hash) throw new Error("Failed to submit transaction after retries");

  console.log("[AGORA] tx submitted →", hash);
  try {
    const receipt = await client.waitForTransactionReceipt({
      hash,
      status: "ACCEPTED",
      interval: 5000,
      retries: 60,
    });
    console.log("[AGORA] receipt →", JSON.stringify(receipt));
    const status = receipt?.status ?? receipt?.consensus_data?.final_state ?? "";
    if (String(status).toUpperCase() === "CANCELED" || String(status).toUpperCase() === "UNDETERMINED") {
      throw new Error(`Transaction ${String(status)}: validation failed`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("timed out")) {
      throw new Error(
        `Validators are still processing — didn't finish within 5 min. ` +
        `Refresh in a minute; the entry usually lands shortly after.`,
      );
    }
    if (isTransient(msg)) {
      throw new Error(
        `Lost connection to Studionet while waiting. ` +
        `Your submission was sent (tx: ${hash}) — check back in a minute.`,
      );
    }
    throw e;
  }
  return String(hash);
}

// ── reads ──────────────────────────────────────────────────────────────────

export async function getStats(): Promise<Stats> {
  const raw = await read("get_stats");
  if (!raw) return { total_entries: 0, total_bounties: 0, total_contributors: 0 };
  return JSON.parse(raw as string);
}

export async function getEntry(entryId: string): Promise<Entry | null> {
  const raw = await read("get_entry", [entryId]);
  if (!raw) return null;
  const parsed = JSON.parse(raw as string);
  return parsed || null;
}

export async function getTopic(slug: string): Promise<Topic | null> {
  const raw = await read("get_topic", [slug]);
  if (!raw) return null;
  const parsed = JSON.parse(raw as string);
  return parsed || null;
}

export async function getTopicEntries(slug: string, n = 50): Promise<Entry[]> {
  const raw = await read("get_topic_entries", [slug, BigInt(n)]);
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

export async function getProfile(address: string): Promise<Profile> {
  const raw = await read("get_profile", [checksum(address)]);
  if (!raw) return { owner: address, reputation: 0, total_entries: 0, verified_count: 0, accepted_count: 0, rejected_count: 0, challenges_won: 0, bounties_claimed: 0 };
  return JSON.parse(raw as string);
}

export async function getUserEntries(address: string, n = 50): Promise<Entry[]> {
  const raw = await read("get_user_entries", [checksum(address), BigInt(n)]);
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

export async function getLeaderboard(n = 20): Promise<Profile[]> {
  const raw = await read("get_leaderboard", [BigInt(n)]);
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

export async function getOpenBounties(n = 50): Promise<Bounty[]> {
  const raw = await read("get_open_bounties", [BigInt(n)]);
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

export async function getBounty(bountyId: string): Promise<Bounty | null> {
  const raw = await read("get_bounty", [bountyId]);
  if (!raw) return null;
  const parsed = JSON.parse(raw as string);
  return parsed || null;
}

export async function getRecentEntries(n = 20): Promise<Entry[]> {
  const raw = await read("get_recent_entries", [BigInt(n)]);
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

export async function getAllTopics(n = 50): Promise<Topic[]> {
  const raw = await read("get_all_topics", [BigInt(n)]);
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

// ── writes ─────────────────────────────────────────────────────────────────

export async function submitEntry(
  client: Client, topic: string, title: string, summary: string, sourceUrl: string
): Promise<string> {
  return writeAndWait(client, "submit_entry", [topic, title, summary, sourceUrl]);
}

export async function challengeEntry(
  client: Client, entryId: string, reason: string
): Promise<string> {
  return writeAndWait(client, "challenge_entry", [entryId, reason]);
}

// Author stakes an APPEAL_BOND (20 reputation) to trigger a fresh, independent
// second-panel ruling on an upheld challenge. Win → entry + reputation restored,
// challenger's reward reversed, bond refunded. Lose → challenge stands, bond forfeited.
export async function appealChallenge(
  client: Client, entryId: string
): Promise<string> {
  return writeAndWait(client, "appeal_challenge", [entryId]);
}

export async function postBounty(
  client: Client, topic: string, question: string, minQuality: number
): Promise<string> {
  return writeAndWait(client, "post_bounty", [topic, question, String(minQuality)]);
}

export async function claimBounty(
  client: Client, bountyId: string, title: string, summary: string, sourceUrl: string
): Promise<string> {
  return writeAndWait(client, "claim_bounty", [bountyId, title, summary, sourceUrl]);
}

// ── formatters ─────────────────────────────────────────────────────────────

export function shortAddr(a: string): string {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
}

export function tierColor(tier: string): string {
  if (tier === "verified") return "var(--color-verified)";
  if (tier === "accepted") return "var(--color-accepted)";
  return "var(--color-rejected)";
}

export function tierBadgeClass(tier: string): string {
  if (tier === "verified") return "badge-verified";
  if (tier === "accepted") return "badge-accepted";
  return "badge-rejected";
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard, shortAddr } from "@/lib/agora";
import { useWallet } from "@/lib/wallet";
import { CONTRACT_CONFIGURED } from "@/lib/config";
import type { Profile } from "@/lib/types";

export default function LeaderboardPage() {
  const { address } = useWallet();
  const [leaders, setLeaders] = useState<Profile[]>([]);

  useEffect(() => {
    if (!CONTRACT_CONFIGURED) return;
    getLeaderboard(50).then(setLeaders).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
        CONTRIBUTORS
      </div>
      <h1 className="display-lg" style={{ marginBottom: "var(--sp-lg)" }}>Leaderboard</h1>

      {leaders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--sp-xxl) 0" }}>
          <p className="display-md" style={{ color: "var(--color-muted)", marginBottom: "var(--sp-sm)" }}>
            No contributors yet.
          </p>
          <Link href="/submit" className="btn-primary">BE THE FIRST</Link>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr repeat(5, 64px)",
            gap: "var(--sp-xs)",
            padding: "var(--sp-xs) 0",
            borderBottom: "1px solid var(--color-hairline)",
          }}>
            <span className="caption-upper">#</span>
            <span className="caption-upper">CONTRIBUTOR</span>
            <span className="caption-upper" style={{ textAlign: "right" }}>REP</span>
            <span className="caption-upper" style={{ textAlign: "right" }}>ENTRIES</span>
            <span className="caption-upper" style={{ textAlign: "right" }}>VERIFIED</span>
            <span className="caption-upper" style={{ textAlign: "right" }}>CHALLENGES</span>
            <span className="caption-upper" style={{ textAlign: "right" }}>BOUNTIES</span>
          </div>

          {leaders.map((p, i) => {
            const isYou = address && address.toLowerCase() === p.owner.toLowerCase();
            return (
              <div key={p.owner} style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr repeat(5, 64px)",
                gap: "var(--sp-xs)",
                padding: "var(--sp-sm) 0",
                borderBottom: "1px solid var(--color-hairline)",
                background: isYou ? "rgba(218,41,28,0.04)" : "transparent",
              }}>
                <span className="mono" style={{
                  fontSize: 18, fontWeight: 700,
                  color: i === 0 ? "var(--color-primary)" : "var(--color-muted)",
                }}>
                  {i + 1}
                </span>
                <span className="title-sm" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xxs)" }}>
                  <span className="mono" style={{ fontSize: 13 }}>{shortAddr(p.owner)}</span>
                  {isYou && <span className="badge" style={{ fontSize: 9, padding: "1px 6px" }}>YOU</span>}
                </span>
                <span className="mono" style={{ textAlign: "right", fontWeight: 700, color: "var(--color-ink)" }}>
                  {p.reputation}
                </span>
                <span className="mono" style={{ textAlign: "right", color: "var(--color-body)" }}>
                  {p.total_entries}
                </span>
                <span className="mono" style={{ textAlign: "right", color: "var(--color-verified)" }}>
                  {p.verified_count}
                </span>
                <span className="mono" style={{ textAlign: "right", color: "var(--color-body)" }}>
                  {p.challenges_won}
                </span>
                <span className="mono" style={{ textAlign: "right", color: "var(--color-body)" }}>
                  {p.bounties_claimed}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

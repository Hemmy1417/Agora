"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getRecentEntries, shortAddr, tierBadgeClass } from "@/lib/agora";
import { CONTRACT_CONFIGURED } from "@/lib/config";
import type { Entry, Stats } from "@/lib/types";

export default function Home() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [recent, setRecent]   = useState<Entry[]>([]);

  useEffect(() => {
    if (!CONTRACT_CONFIGURED) return;
    getStats().then(setStats).catch(() => {});
    getRecentEntries(6).then(setRecent).catch(() => {});
  }, []);

  return (
    <>
      {/* ── Hero band: cinematic, full-viewport ── */}
      <section style={{
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "var(--sp-super) var(--sp-lg) var(--sp-xxl)",
        background: "radial-gradient(ellipse at 30% 20%, rgba(218,41,28,0.06), transparent 60%), var(--color-canvas)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", position: "relative" }}>
          <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-sm)" }}>
            CROWD-SOURCED · AI-VERIFIED · ON-CHAIN
          </div>

          <h1 className="display-mega" style={{ maxWidth: 900, marginBottom: "var(--sp-md)" }}>
            Knowledge that<br />earns its place.
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--color-body)", maxWidth: 560, marginBottom: "var(--sp-lg)" }}>
            Submit what you know. AI validators verify it against the source.
            Good research earns reputation. Bad claims get challenged.
            Every entry lives on-chain — permanent, auditable, real.
          </p>

          <div style={{ display: "flex", gap: "var(--sp-xs)", flexWrap: "wrap" }}>
            <Link href="/submit" className="btn-primary">CONTRIBUTE</Link>
            <Link href="/explore" className="btn-outline">EXPLORE</Link>
          </div>
        </div>
      </section>

      {/* ── Live Stats Band ── */}
      {stats && (
        <section style={{
          borderTop: "1px solid var(--color-hairline)",
          borderBottom: "1px solid var(--color-hairline)",
          padding: "var(--sp-lg) var(--sp-lg)",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-md)",
            textAlign: "center",
          }}>
            {[
              { value: stats.total_entries,      label: "ENTRIES" },
              { value: stats.total_bounties,     label: "BOUNTIES" },
              { value: stats.total_contributors, label: "CONTRIBUTORS" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="number-display" style={{ color: "var(--color-ink)" }}>{value}</div>
                <div className="caption-upper" style={{ marginTop: "var(--sp-xxs)" }}>{label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section style={{ padding: "var(--sp-xxl) var(--sp-lg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
            HOW IT WORKS
          </div>
          <h2 className="display-lg" style={{ marginBottom: "var(--sp-xl)" }}>
            Three moves. Permanent record.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--sp-md)" }}>
            {[
              { num: "01", title: "SUBMIT", body: "Write a summary of something you found. Paste the source URL. Pick a topic. Hit submit." },
              { num: "02", title: "VALIDATE", body: "GenLayer validators fetch your source independently. AI scores your summary for accuracy, relevance, quality, and novelty." },
              { num: "03", title: "EARN", body: "High-quality entries earn reputation. Verified tier doubles your reward. Your track record lives on-chain forever." },
            ].map(({ num, title, body }) => (
              <div key={num} className="card" style={{ padding: "var(--sp-md)" }}>
                <div className="mono" style={{ color: "var(--color-primary)", fontSize: 48, fontWeight: 700, marginBottom: "var(--sp-xs)", opacity: 0.5 }}>
                  {num}
                </div>
                <div className="title-md" style={{ marginBottom: "var(--sp-xxs)" }}>{title}</div>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--color-body)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rosso Corsa accent band: Bounties + Challenges ── */}
      <section style={{ background: "var(--color-primary)", padding: "var(--sp-xxl) var(--sp-lg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--sp-xl)" }}>
          <div>
            <div className="caption-upper" style={{ color: "rgba(255,255,255,0.7)", marginBottom: "var(--sp-xs)" }}>BOUNTIES</div>
            <h2 className="display-lg" style={{ color: "#fff", marginBottom: "var(--sp-sm)" }}>
              Post a question.<br />Pay for answers.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", marginBottom: "var(--sp-md)" }}>
              Set a topic and minimum quality threshold. Anyone can claim your bounty by submitting a verified entry that meets the bar.
            </p>
            <Link href="/bounties" className="btn-outline" style={{ borderColor: "#fff", color: "#fff" }}>VIEW BOUNTIES</Link>
          </div>
          <div>
            <div className="caption-upper" style={{ color: "rgba(255,255,255,0.7)", marginBottom: "var(--sp-xs)" }}>CHALLENGES</div>
            <h2 className="display-lg" style={{ color: "#fff", marginBottom: "var(--sp-sm)" }}>
              See something wrong?<br />Call it out.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", marginBottom: "var(--sp-md)" }}>
              Challenge any entry with a reason. AI re-evaluates from scratch. If the challenge holds, you earn reputation and the entry gets downgraded.
            </p>
            <Link href="/explore" className="btn-outline" style={{ borderColor: "#fff", color: "#fff" }}>BROWSE ENTRIES</Link>
          </div>
        </div>
      </section>

      {/* ── Recent Entries Feed ── */}
      {recent.length > 0 && (
        <section style={{ padding: "var(--sp-xxl) var(--sp-lg)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--sp-md)" }}>
              <h2 className="display-lg">Recent entries</h2>
              <Link href="/explore" className="btn-ghost">VIEW ALL →</Link>
            </div>

            {recent.map(entry => (
              <Link key={entry.entry_id} href={`/entry/${entry.entry_id}`}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
                  gap: "var(--sp-md)", padding: "var(--sp-sm) 0",
                  borderBottom: "1px solid var(--color-hairline)",
                  textDecoration: "none", color: "inherit",
                }}>
                <div>
                  <span className={tierBadgeClass(entry.tier)} style={{
                    display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "1px",
                    textTransform: "uppercase", padding: "2px 8px", borderRadius: "9999px", marginRight: 10,
                  }}>
                    {entry.tier}
                  </span>
                  <span className="title-sm">{entry.title}</span>
                  <div className="caption" style={{ marginTop: 4 }}>
                    {entry.topic} · {shortAddr(entry.owner)} · {entry.overall_score}/100
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: "var(--color-muted)" }}>
                  +{entry.reward}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA Band ── */}
      <section style={{ padding: "var(--sp-xxl) var(--sp-lg)", textAlign: "center", borderTop: "1px solid var(--color-hairline)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className="display-lg" style={{ marginBottom: "var(--sp-sm)" }}>The record is open.</h2>
          <p style={{ fontSize: 14, color: "var(--color-body)", marginBottom: "var(--sp-md)" }}>
            Every entry verified by AI validators. Every score auditable on-chain.
            No middleman. No editorial board. Just evidence.
          </p>
          <Link href="/auth" className="btn-primary">GET STARTED</Link>
        </div>
      </section>
    </>
  );
}

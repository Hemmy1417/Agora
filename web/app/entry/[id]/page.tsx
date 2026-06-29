"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEntry, challengeEntry, shortAddr, tierBadgeClass, tierColor } from "@/lib/agora";
import { useWallet } from "@/lib/wallet";
import type { Entry } from "@/lib/types";

export default function EntryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { address, client } = useWallet();

  const [entry, setEntry]           = useState<Entry | null>(null);
  const [loading, setLoading]       = useState(true);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [reason, setReason]         = useState("");
  const [challenging, setChallenging] = useState(false);
  const [challengeResult, setChallengeResult] = useState("");

  useEffect(() => {
    if (!id) return;
    getEntry(id).then(e => { setEntry(e); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function handleChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !entry) return;
    setChallenging(true); setChallengeResult("");
    try {
      await challengeEntry(client, entry.entry_id, reason);
      const updated = await getEntry(entry.entry_id);
      if (updated) setEntry(updated);
      setChallengeResult("Challenge processed. Entry re-evaluated.");
      setChallengeOpen(false); setReason("");
    } catch (err) {
      setChallengeResult(err instanceof Error ? err.message : "Challenge failed");
    } finally {
      setChallenging(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="caption-upper">Loading…</span>
      </div>
    );
  }

  if (!entry) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="display-lg" style={{ marginBottom: "var(--sp-sm)" }}>Entry not found</h1>
          <Link href="/explore" className="btn-primary">BROWSE ENTRIES</Link>
        </div>
      </div>
    );
  }

  const canChallenge = address && address.toLowerCase() !== entry.owner.toLowerCase() && entry.status === "active";

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--sp-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", marginBottom: "var(--sp-xs)" }}>
          <span className={tierBadgeClass(entry.tier)} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
            padding: "3px 10px", borderRadius: "9999px",
          }}>
            {entry.verdict}
          </span>
          <Link href={`/topic/${entry.topic_slug}`} className="badge" style={{ textDecoration: "none" }}>
            {entry.topic}
          </Link>
          {entry.status === "disputed" && (
            <span className="badge badge-rejected">DISPUTED</span>
          )}
        </div>

        <h1 className="display-xl" style={{ marginBottom: "var(--sp-sm)" }}>{entry.title}</h1>

        <div className="caption" style={{ display: "flex", gap: "var(--sp-sm)", flexWrap: "wrap" }}>
          <span>by <Link href={`/profile?addr=${entry.owner}`} style={{ color: "var(--color-ink)", textDecoration: "underline" }}>{shortAddr(entry.owner)}</Link></span>
          <span>·</span>
          <span>Source: <a href={entry.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>Link ↗</a></span>
          <span>·</span>
          <span>{entry.source_confirmed ? "Source confirmed ✓" : "Source unconfirmed"}</span>
          <span>·</span>
          <span>{entry.challenges} challenge{entry.challenges !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Score Panel — sidebar annotation feel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "var(--sp-lg)" }}>
        {/* Main: Summary */}
        <div>
          <div className="caption-upper" style={{ marginBottom: "var(--sp-xs)" }}>SUMMARY</div>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--color-ink)", whiteSpace: "pre-wrap" }}>
            {entry.summary}
          </p>

          {entry.key_facts && (
            <div style={{ marginTop: "var(--sp-lg)" }}>
              <div className="caption-upper" style={{ marginBottom: "var(--sp-xs)" }}>KEY FACTS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xxs)" }}>
                {entry.key_facts.split(",").map((fact, i) => (
                  <span key={i} className="badge" style={{ fontSize: 11 }}>{fact.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI Feedback */}
          <div style={{
            marginTop: "var(--sp-lg)",
            borderLeft: `3px solid ${tierColor(entry.tier)}`,
            paddingLeft: "var(--sp-sm)",
          }}>
            <div className="caption-upper" style={{ marginBottom: "var(--sp-xxs)" }}>AI VALIDATOR FEEDBACK</div>
            <p className="body-md" style={{ color: "var(--color-body)", fontStyle: "italic" }}>
              "{entry.feedback}"
            </p>
          </div>
        </div>

        {/* Sidebar: Scores */}
        <div>
          <div className="card" style={{ padding: "var(--sp-sm)" }}>
            <div style={{ textAlign: "center", marginBottom: "var(--sp-sm)" }}>
              <div className="mono" style={{ fontSize: 56, fontWeight: 700, color: tierColor(entry.tier) }}>
                {entry.overall_score}
              </div>
              <div className="caption-upper">OVERALL SCORE</div>
            </div>

            <hr className="divider" style={{ margin: "var(--sp-xs) 0" }} />

            {[
              { label: "Accuracy",  score: entry.accuracy_score },
              { label: "Relevance", score: entry.relevance_score },
              { label: "Quality",   score: entry.quality_score },
              { label: "Novelty",   score: entry.novelty_score },
            ].map(({ label, score }) => (
              <div key={label} style={{ marginBottom: "var(--sp-xs)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span className="caption">{label}</span>
                  <span className="mono" style={{ fontSize: 13, color: "var(--color-ink)" }}>{score}</span>
                </div>
                <div className="score-bar">
                  <div
                    className={`score-bar-fill ${score >= 80 ? "fill-verified" : score >= 50 ? "fill-accepted" : "fill-rejected"}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}

            <hr className="divider" style={{ margin: "var(--sp-xs) 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="caption">Reputation earned</span>
              <span className="mono" style={{ fontWeight: 700, color: "var(--color-ink)" }}>+{entry.reward}</span>
            </div>
          </div>

          {/* Challenge button */}
          {canChallenge && (
            <button
              onClick={() => setChallengeOpen(o => !o)}
              className="btn-outline"
              style={{ width: "100%", marginTop: "var(--sp-xs)", borderColor: "var(--color-rejected)", color: "var(--color-rejected)" }}
            >
              CHALLENGE THIS ENTRY
            </button>
          )}
        </div>
      </div>

      {/* Challenge form */}
      {challengeOpen && (
        <div style={{ marginTop: "var(--sp-lg)", borderTop: "1px solid var(--color-hairline)", paddingTop: "var(--sp-md)" }}>
          <h3 className="title-md" style={{ marginBottom: "var(--sp-xs)" }}>Challenge this entry</h3>
          <p className="body-sm" style={{ marginBottom: "var(--sp-sm)" }}>
            Explain why this entry is inaccurate, misleading, or low quality. AI will re-evaluate the entry against your objection.
          </p>
          <form onSubmit={handleChallenge} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xs)" }}>
            <textarea
              className="input" placeholder="Your reason for challenging…"
              value={reason} onChange={e => setReason(e.target.value)}
              required minLength={20} style={{ minHeight: 100 }}
            />
            <button type="submit" className="btn-primary" disabled={challenging} style={{ alignSelf: "flex-start" }}>
              {challenging ? "AI IS RE-EVALUATING…" : "SUBMIT CHALLENGE"}
            </button>
          </form>
        </div>
      )}

      {challengeResult && (
        <div style={{
          marginTop: "var(--sp-sm)",
          padding: "var(--sp-xs)",
          background: "var(--color-surface-card)",
          fontSize: 13,
        }}>
          {challengeResult}
        </div>
      )}
    </div>
  );
}

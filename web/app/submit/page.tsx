"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { submitEntry } from "@/lib/agora";
import type { Entry } from "@/lib/types";

export default function SubmitPage() {
  const { address, client } = useWallet();

  const [topic, setTopic]       = useState("");
  const [title, setTitle]       = useState("");
  const [summary, setSummary]   = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState<Entry | null>(null);
  const [txHash, setTxHash]     = useState("");

  if (!address) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="display-lg" style={{ marginBottom: "var(--sp-sm)" }}>Submit knowledge</h1>
          <p className="body-md" style={{ color: "var(--color-body)", marginBottom: "var(--sp-md)" }}>
            Sign in to contribute to the record.
          </p>
          <Link href="/auth" className="btn-primary">SIGN IN</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setError(""); setSubmitting(true); setResult(null);

    try {
      const hash = await submitEntry(client, topic, title, summary, sourceUrl);
      setTxHash(hash);

      const { getRecentEntries } = await import("@/lib/agora");
      const entries = await getRecentEntries(1);
      if (entries.length > 0) setResult(entries[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
        NEW ENTRY
      </div>
      <h1 className="display-lg" style={{ marginBottom: "var(--sp-sm)" }}>
        Submit to the record
      </h1>
      <p className="body-md" style={{ color: "var(--color-body)", marginBottom: "var(--sp-xl)" }}>
        Write a clear summary of information you found. Paste the source URL.
        AI validators will fetch the source independently, verify your summary,
        and score it for accuracy, relevance, quality, and novelty.
      </p>

      {/* ── Result Card ── */}
      {result && (
        <div style={{
          background: "var(--color-surface-card)",
          padding: "var(--sp-md)",
          marginBottom: "var(--sp-xl)",
          borderLeft: `3px solid ${result.tier === "verified" ? "var(--color-verified)" : result.tier === "accepted" ? "var(--color-accepted)" : "var(--color-rejected)"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-xs)" }}>
            <span className={`badge badge-${result.tier}`} style={{ textTransform: "uppercase" }}>
              {result.verdict}
            </span>
            <span className="mono" style={{ fontSize: 32, fontWeight: 700, color: "var(--color-ink)" }}>
              {result.overall_score}<span style={{ fontSize: 16, color: "var(--color-muted)" }}>/100</span>
            </span>
          </div>

          <p className="body-md" style={{ color: "var(--color-body)", marginBottom: "var(--sp-sm)" }}>
            {result.feedback}
          </p>

          {/* Score breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-xs)" }}>
            {[
              { label: "Accuracy",  score: result.accuracy_score },
              { label: "Relevance", score: result.relevance_score },
              { label: "Quality",   score: result.quality_score },
              { label: "Novelty",   score: result.novelty_score },
            ].map(({ label, score }) => (
              <div key={label}>
                <div className="caption-upper" style={{ marginBottom: 4 }}>{label}</div>
                <div className="score-bar">
                  <div
                    className={`score-bar-fill ${score >= 80 ? "fill-verified" : score >= 50 ? "fill-accepted" : "fill-rejected"}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="mono" style={{ fontSize: 13, marginTop: 2, color: "var(--color-ink)" }}>{score}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "var(--sp-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="caption">Reputation earned: <strong style={{ color: "var(--color-ink)" }}>+{result.reward}</strong></span>
            <Link href={`/entry/${result.entry_id}`} className="btn-ghost" style={{ fontSize: 12 }}>
              VIEW ENTRY →
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(241,58,44,0.1)", border: "1px solid var(--color-rejected)",
          padding: "var(--sp-xs)", marginBottom: "var(--sp-md)", fontSize: 13, color: "var(--color-rejected)",
        }}>
          {error}
        </div>
      )}

      {/* ── Writing Form ── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-sm)" }}>
        <div>
          <label className="caption-upper" style={{ display: "block", marginBottom: "var(--sp-xxs)" }}>TOPIC</label>
          <input
            className="input" placeholder="e.g. Ethereum, Solana, DeFi, AI"
            value={topic} onChange={e => setTopic(e.target.value)} required
          />
        </div>

        <div>
          <label className="caption-upper" style={{ display: "block", marginBottom: "var(--sp-xxs)" }}>TITLE</label>
          <input
            className="input" placeholder="A clear, specific title for your entry"
            value={title} onChange={e => setTitle(e.target.value)} required maxLength={200}
          />
        </div>

        <div>
          <label className="caption-upper" style={{ display: "block", marginBottom: "var(--sp-xxs)" }}>SOURCE URL</label>
          <input
            className="input" type="url" placeholder="https://..."
            value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} required
          />
          <p className="caption" style={{ marginTop: 4 }}>
            AI validators will fetch this page independently to verify your summary.
          </p>
        </div>

        <div>
          <label className="caption-upper" style={{ display: "block", marginBottom: "var(--sp-xxs)" }}>SUMMARY</label>
          <textarea
            className="input" placeholder="Write a clear, accurate summary of the information you found at the source URL. Be specific — AI will score accuracy, relevance, quality, and novelty."
            value={summary} onChange={e => setSummary(e.target.value)} required maxLength={2000}
            style={{ minHeight: 180 }}
          />
          <div className="caption" style={{ textAlign: "right", marginTop: 4 }}>
            {summary.length}/2000
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting || !client} style={{ width: "100%", marginTop: "var(--sp-xs)" }}>
          {submitting ? "VALIDATORS ARE REVIEWING…" : "SUBMIT FOR VERIFICATION"}
        </button>

        {submitting && (
          <p className="caption" style={{ textAlign: "center" }}>
            AI validators are fetching your source and scoring your summary.
            This typically takes 1–3 minutes. Do not close this page.
          </p>
        )}
      </form>
    </div>
  );
}

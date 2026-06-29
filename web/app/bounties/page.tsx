"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOpenBounties, postBounty, shortAddr } from "@/lib/agora";
import { useWallet } from "@/lib/wallet";
import { CONTRACT_CONFIGURED } from "@/lib/config";
import type { Bounty } from "@/lib/types";

export default function BountiesPage() {
  const { address, client } = useWallet();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic]       = useState("");
  const [question, setQuestion] = useState("");
  const [minQuality, setMinQuality] = useState("70");
  const [posting, setPosting]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!CONTRACT_CONFIGURED) return;
    getOpenBounties(50).then(setBounties).catch(() => {});
  }, []);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setPosting(true); setError("");
    try {
      await postBounty(client, topic, question, parseInt(minQuality));
      setShowForm(false); setTopic(""); setQuestion(""); setMinQuality("70");
      getOpenBounties(50).then(setBounties).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post bounty");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-lg)" }}>
        <div>
          <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
            OPEN QUESTIONS
          </div>
          <h1 className="display-lg">Bounties</h1>
        </div>
        {address && (
          <button onClick={() => setShowForm(o => !o)} className="btn-primary" style={{ height: 40, padding: "8px 24px", fontSize: 12 }}>
            {showForm ? "CANCEL" : "POST BOUNTY"}
          </button>
        )}
      </div>

      {/* Post form */}
      {showForm && (
        <div className="card" style={{ padding: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
          <h3 className="title-md" style={{ marginBottom: "var(--sp-sm)" }}>Post a research bounty</h3>
          {error && (
            <div style={{
              background: "rgba(241,58,44,0.1)", border: "1px solid var(--color-rejected)",
              padding: "var(--sp-xs)", marginBottom: "var(--sp-sm)", fontSize: 13, color: "var(--color-rejected)",
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xs)" }}>
            <div>
              <label className="caption-upper" style={{ display: "block", marginBottom: 4 }}>TOPIC</label>
              <input className="input" placeholder="e.g. Ethereum, AI, DeFi" value={topic} onChange={e => setTopic(e.target.value)} required />
            </div>
            <div>
              <label className="caption-upper" style={{ display: "block", marginBottom: 4 }}>QUESTION</label>
              <textarea className="input" placeholder="What do you want someone to research and summarize?"
                value={question} onChange={e => setQuestion(e.target.value)} required style={{ minHeight: 80 }} />
            </div>
            <div>
              <label className="caption-upper" style={{ display: "block", marginBottom: 4 }}>MINIMUM QUALITY SCORE (50–100)</label>
              <input className="input" type="number" min="50" max="100" value={minQuality}
                onChange={e => setMinQuality(e.target.value)} style={{ maxWidth: 120 }} />
            </div>
            <button type="submit" className="btn-primary" disabled={posting} style={{ alignSelf: "flex-start" }}>
              {posting ? "POSTING…" : "POST BOUNTY"}
            </button>
          </form>
        </div>
      )}

      {/* Bounty list */}
      {bounties.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--sp-xxl) 0" }}>
          <p className="display-md" style={{ color: "var(--color-muted)", marginBottom: "var(--sp-sm)" }}>
            No open bounties.
          </p>
          {address ? (
            <button onClick={() => setShowForm(true)} className="btn-primary">POST THE FIRST BOUNTY</button>
          ) : (
            <Link href="/auth" className="btn-primary">SIGN IN TO POST</Link>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 0 }}>
          {bounties.map(b => (
            <div key={b.bounty_id} style={{
              padding: "var(--sp-sm) 0",
              borderBottom: "1px solid var(--color-hairline)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-xs)", marginBottom: 6 }}>
                <span className="badge badge-bounty">BOUNTY</span>
                <span className="badge">{b.topic}</span>
              </div>
              <p className="title-sm" style={{ marginBottom: 6 }}>{b.question}</p>
              <div className="caption" style={{ display: "flex", gap: "var(--sp-sm)" }}>
                <span>Posted by {shortAddr(b.poster)}</span>
                <span>·</span>
                <span>Min quality: {b.min_quality}/100</span>
              </div>
              {address && address.toLowerCase() !== b.poster.toLowerCase() && (
                <Link href={`/submit?bounty=${b.bounty_id}&topic=${encodeURIComponent(b.topic)}`}
                  className="btn-ghost" style={{ marginTop: "var(--sp-xxs)", fontSize: 12 }}>
                  CLAIM THIS BOUNTY →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

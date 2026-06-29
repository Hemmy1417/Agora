"use client";

import { useEffect, useState } from "react";
import { CONTRACT_ADDRESS } from "@/lib/config";
import { getStats } from "@/lib/agora";
import type { Stats } from "@/lib/types";

export default function CompliancePage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [copied, setCopied]   = useState(false);
  const studioUrl = `https://studio.genlayer.com/?import-contract=${CONTRACT_ADDRESS}`;

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  function copyAddr() {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
        TRANSPARENCY
      </div>
      <h1 className="display-lg" style={{ marginBottom: "var(--sp-sm)" }}>Compliance</h1>
      <p className="body-md" style={{ color: "var(--color-body)", maxWidth: 600, marginBottom: "var(--sp-xl)" }}>
        Every entry, score, and reputation change is recorded on-chain. The contract is public.
        The AI validation logic is readable. Nothing is hidden.
      </p>

      {/* Contract info */}
      <div className="card" style={{ padding: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
        <div className="title-md" style={{ marginBottom: "var(--sp-sm)" }}>Contract</div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--sp-md)",
        }}>
          <div>
            <div className="caption-upper" style={{ marginBottom: 4 }}>ADDRESS</div>
            <button onClick={copyAddr} className="mono" style={{
              fontSize: 12, color: "var(--color-ink)", background: "transparent",
              border: "none", cursor: "pointer", wordBreak: "break-all", textAlign: "left",
            }}>
              {CONTRACT_ADDRESS}
              <span style={{ marginLeft: 6, color: "var(--color-primary)" }}>
                {copied ? "✓" : "copy"}
              </span>
            </button>
          </div>
          <div>
            <div className="caption-upper" style={{ marginBottom: 4 }}>NETWORK</div>
            <span className="body-md">GenLayer Studionet (Chain 61999)</span>
          </div>
          <div>
            <div className="caption-upper" style={{ marginBottom: 4 }}>STUDIO</div>
            <a href={studioUrl} target="_blank" rel="noopener noreferrer"
              className="body-md" style={{ color: "var(--color-primary)" }}>
              View in GenLayer Studio ↗
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="card" style={{ padding: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
          <div className="title-md" style={{ marginBottom: "var(--sp-sm)" }}>On-chain stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-md)" }}>
            {[
              { value: stats.total_entries, label: "ENTRIES" },
              { value: stats.total_bounties, label: "BOUNTIES" },
              { value: stats.total_contributors, label: "CONTRIBUTORS" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: "var(--color-ink)" }}>{value}</div>
                <div className="caption-upper">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Tiers */}
      <div className="card" style={{ padding: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
        <div className="title-md" style={{ marginBottom: "var(--sp-sm)" }}>Quality tiers</div>
        <div style={{ display: "grid", gap: "var(--sp-xs)" }}>
          {[
            { tier: "VERIFIED", range: "80–100", reward: "2×", color: "var(--color-verified)", desc: "High-quality, accurate, well-sourced. AI confirms summary matches source." },
            { tier: "ACCEPTED", range: "50–79", reward: "1×", color: "var(--color-accepted)", desc: "Decent contribution. Summary is broadly accurate but may lack depth or novelty." },
            { tier: "REJECTED", range: "0–49", reward: "0×", color: "var(--color-rejected)", desc: "Low quality, inaccurate, or irrelevant. No reputation awarded." },
          ].map(({ tier, range, reward, color, desc }) => (
            <div key={tier} style={{
              display: "grid", gridTemplateColumns: "100px 70px 50px 1fr",
              gap: "var(--sp-sm)", padding: "var(--sp-xs) 0",
              borderBottom: "1px solid var(--color-hairline)",
              alignItems: "center",
            }}>
              <span className="caption-upper" style={{ color }}>{tier}</span>
              <span className="mono" style={{ fontSize: 13, color: "var(--color-body)" }}>{range}</span>
              <span className="mono" style={{ fontSize: 13, color: "var(--color-ink)" }}>{reward}</span>
              <span className="body-sm">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="card" style={{ padding: "var(--sp-md)" }}>
        <div className="title-md" style={{ marginBottom: "var(--sp-sm)" }}>Validation methodology</div>
        <div style={{ display: "grid", gap: "var(--sp-sm)" }}>
          {[
            { num: "01", title: "Source fetch", desc: "Validators independently fetch the source URL provided by the submitter." },
            { num: "02", title: "AI evaluation", desc: "Each validator's AI scores the summary across four dimensions: accuracy, relevance, quality, and novelty." },
            { num: "03", title: "Consensus", desc: "Validators must agree on the verdict (Verified/Accepted/Rejected) and overall score within 15 points via gl.eq_principle.prompt_comparative." },
            { num: "04", title: "On-chain record", desc: "The accepted result is stored permanently. The entry, score, feedback, and reward are all auditable." },
            { num: "05", title: "Challenge arbitration", desc: "Any user can challenge an entry. AI re-evaluates with the challenger's objection. If valid, the entry is downgraded and the challenger earns reputation." },
          ].map(({ num, title, desc }) => (
            <div key={num} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "var(--sp-xs)" }}>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)", opacity: 0.5 }}>{num}</span>
              <div>
                <div className="title-sm" style={{ marginBottom: 2 }}>{title}</div>
                <p className="body-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { getProfile, getUserEntries, shortAddr, tierBadgeClass } from "@/lib/agora";
import { CONTRACT_CONFIGURED } from "@/lib/config";
import type { Profile, Entry } from "@/lib/types";

export default function ProfilePage() {
  const { address, authMethod, exportKey } = useWallet();

  const [profile, setProfile]     = useState<Profile | null>(null);
  const [entries, setEntries]     = useState<Entry[]>([]);
  const [privKey, setPrivKey]     = useState("");
  const [showKey, setShowKey]     = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (!address || !CONTRACT_CONFIGURED) return;
    const [p, e] = await Promise.all([
      getProfile(address).catch(() => null),
      getUserEntries(address, 50).catch(() => []),
    ]);
    if (p) setProfile(p);
    setEntries(e);
  }, [address]);

  useEffect(() => { load(); }, [load]);

  async function handleExport() {
    setExporting(true);
    try {
      const key = await exportKey();
      setPrivKey(key); setShowKey(true);
    } catch {} finally { setExporting(false); }
  }

  if (!address) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="display-lg" style={{ marginBottom: "var(--sp-sm)" }}>Your profile</h1>
          <p className="body-md" style={{ color: "var(--color-body)", marginBottom: "var(--sp-md)" }}>Sign in to view.</p>
          <Link href="/auth" className="btn-primary">SIGN IN</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>PROFILE</div>

      {/* Identity + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--sp-lg)", marginBottom: "var(--sp-xl)" }}>
        <div>
          <h1 className="display-lg" style={{ marginBottom: "var(--sp-xxs)" }}>
            {shortAddr(address)}
          </h1>
          <p className="caption" style={{ marginBottom: "var(--sp-sm)" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--color-body)" }}>{address}</span>
          </p>
          <div style={{ display: "flex", gap: "var(--sp-xs)" }}>
            <span className="badge">{authMethod === "email" ? "EMAIL" : "WALLET"}</span>
          </div>
        </div>

        {profile && (
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 56, fontWeight: 700, color: "var(--color-primary)" }}>
              {profile.reputation}
            </div>
            <div className="caption-upper">REPUTATION</div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      {profile && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "var(--sp-xs)", marginBottom: "var(--sp-xl)",
        }}>
          {[
            { value: profile.total_entries, label: "Entries" },
            { value: profile.verified_count, label: "Verified", color: "var(--color-verified)" },
            { value: profile.accepted_count, label: "Accepted", color: "var(--color-accepted)" },
            { value: profile.rejected_count, label: "Rejected", color: "var(--color-rejected)" },
            { value: profile.challenges_won, label: "Challenges won" },
            { value: profile.bounties_claimed, label: "Bounties claimed" },
          ].map(({ value, label, color }) => (
            <div key={label} className="card" style={{ padding: "var(--sp-sm)", textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: color || "var(--color-ink)" }}>
                {value}
              </div>
              <div className="caption-upper" style={{ marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Key export */}
      {authMethod === "email" && (
        <div className="card" style={{ padding: "var(--sp-sm)", marginBottom: "var(--sp-xl)" }}>
          <div className="title-sm" style={{ marginBottom: "var(--sp-xxs)" }}>Private Key</div>
          {showKey ? (
            <>
              <p className="mono" style={{
                fontSize: 12, wordBreak: "break-all",
                background: "var(--color-canvas)", padding: "var(--sp-xs)",
                border: "1px solid var(--color-hairline)", marginBottom: "var(--sp-xs)",
              }}>
                {privKey}
              </p>
              <p className="caption" style={{ color: "var(--color-rejected)" }}>
                Store this safely. Anyone with this key controls your wallet and on-chain identity.
              </p>
            </>
          ) : (
            <button onClick={handleExport} className="btn-outline" disabled={exporting} style={{ height: 36, padding: "6px 16px", fontSize: 12 }}>
              {exporting ? "LOADING…" : "EXPORT PRIVATE KEY"}
            </button>
          )}
        </div>
      )}

      {/* Entries */}
      <div>
        <h2 className="title-md" style={{ marginBottom: "var(--sp-sm)" }}>Your entries</h2>
        {entries.length === 0 ? (
          <div style={{ padding: "var(--sp-lg) 0", textAlign: "center" }}>
            <p className="body-md" style={{ color: "var(--color-muted)", marginBottom: "var(--sp-sm)" }}>No entries yet.</p>
            <Link href="/submit" className="btn-primary" style={{ height: 40, padding: "8px 24px", fontSize: 12 }}>
              SUBMIT YOUR FIRST
            </Link>
          </div>
        ) : (
          entries.map(entry => (
            <Link key={entry.entry_id} href={`/entry/${entry.entry_id}`}
              style={{
                display: "block", padding: "var(--sp-sm) 0",
                borderBottom: "1px solid var(--color-hairline)",
                textDecoration: "none", color: "inherit",
              }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-xs)", marginBottom: 4 }}>
                <span className={tierBadgeClass(entry.tier)} style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                  padding: "2px 8px", borderRadius: "9999px",
                }}>
                  {entry.tier}
                </span>
                <span className="title-sm">{entry.title}</span>
              </div>
              <div className="caption">
                {entry.topic} · {entry.overall_score}/100 · +{entry.reward} rep
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

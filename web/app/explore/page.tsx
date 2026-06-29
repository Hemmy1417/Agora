"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentEntries, getAllTopics, shortAddr, tierBadgeClass } from "@/lib/agora";
import { CONTRACT_CONFIGURED } from "@/lib/config";
import type { Entry, Topic } from "@/lib/types";

export default function ExplorePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [topics, setTopics]   = useState<Topic[]>([]);
  const [filter, setFilter]   = useState<string>("");

  useEffect(() => {
    if (!CONTRACT_CONFIGURED) return;
    getRecentEntries(50).then(setEntries).catch(() => {});
    getAllTopics(50).then(setTopics).catch(() => {});
  }, []);

  const filtered = filter
    ? entries.filter(e => e.topic_slug === filter)
    : entries;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
        KNOWLEDGE BASE
      </div>
      <h1 className="display-lg" style={{ marginBottom: "var(--sp-md)" }}>Explore</h1>

      {/* Topic filters */}
      {topics.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xxs)", marginBottom: "var(--sp-lg)" }}>
          <button
            onClick={() => setFilter("")}
            className="badge"
            style={{
              cursor: "pointer", border: "none",
              background: !filter ? "var(--color-primary)" : "var(--color-canvas-elevated)",
              color: !filter ? "var(--color-on-primary)" : "var(--color-ink)",
            }}
          >
            ALL
          </button>
          {topics.map(t => (
            <button
              key={t.slug}
              onClick={() => setFilter(t.slug)}
              className="badge"
              style={{
                cursor: "pointer", border: "none",
                background: filter === t.slug ? "var(--color-primary)" : "var(--color-canvas-elevated)",
                color: filter === t.slug ? "var(--color-on-primary)" : "var(--color-ink)",
              }}
            >
              {t.display_name} ({t.entry_count})
            </button>
          ))}
        </div>
      )}

      {/* Entry feed */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--sp-xxl) 0" }}>
          <p className="display-md" style={{ color: "var(--color-muted)", marginBottom: "var(--sp-sm)" }}>
            No entries yet.
          </p>
          <Link href="/submit" className="btn-primary">BE THE FIRST</Link>
        </div>
      ) : (
        <div>
          {filtered.map(entry => (
            <Link key={entry.entry_id} href={`/entry/${entry.entry_id}`}
              style={{
                display: "block",
                padding: "var(--sp-sm) 0",
                borderBottom: "1px solid var(--color-hairline)",
                textDecoration: "none", color: "inherit",
              }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-xs)", marginBottom: 6 }}>
                <span className={tierBadgeClass(entry.tier)} style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                  padding: "2px 8px", borderRadius: "9999px",
                }}>
                  {entry.tier}
                </span>
                <span className="title-sm">{entry.title}</span>
              </div>
              <p className="body-sm" style={{ color: "var(--color-body)", marginBottom: 6, maxWidth: 700 }}>
                {entry.summary.slice(0, 200)}{entry.summary.length > 200 ? "…" : ""}
              </p>
              <div className="caption" style={{ display: "flex", gap: "var(--sp-sm)" }}>
                <span>{entry.topic}</span>
                <span>·</span>
                <span>{shortAddr(entry.owner)}</span>
                <span>·</span>
                <span className="mono">{entry.overall_score}/100</span>
                <span>·</span>
                <span>+{entry.reward} rep</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

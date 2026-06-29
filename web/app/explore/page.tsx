"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentEntries, getAllTopics, shortAddr, tierBadgeClass } from "@/lib/agora";
import { CONTRACT_CONFIGURED } from "@/lib/config";
import type { Entry, Topic } from "@/lib/types";

const PAGE_SIZE = 12;

export default function ExplorePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [topics, setTopics]   = useState<Topic[]>([]);
  const [filter, setFilter]   = useState<string>("");
  const [search, setSearch]   = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!CONTRACT_CONFIGURED) return;
    getRecentEntries(200).then(setEntries).catch(() => {});
    getAllTopics(100).then(setTopics).catch(() => {});
  }, []);

  const q = search.toLowerCase().trim();
  const filtered = entries
    .filter(e => !filter || e.topic_slug === filter)
    .filter(e => !q || e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q) || e.topic.toLowerCase().includes(q));

  const page = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  useEffect(() => { setVisible(PAGE_SIZE); }, [filter, search]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
        KNOWLEDGE BASE
      </div>
      <h1 className="display-lg" style={{ marginBottom: "var(--sp-md)" }}>Explore</h1>

      {/* Search */}
      <div style={{ marginBottom: "var(--sp-md)" }}>
        <input
          type="text"
          className="input"
          placeholder="Search entries by title, topic, or keyword…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 480 }}
        />
      </div>

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

      {/* Results count */}
      {q && (
        <p className="caption" style={{ marginBottom: "var(--sp-sm)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Entry feed */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--sp-xxl) 0" }}>
          <p className="display-md" style={{ color: "var(--color-muted)", marginBottom: "var(--sp-sm)" }}>
            {q ? "No entries match your search." : "No entries yet."}
          </p>
          {!q && <Link href="/submit" className="btn-primary">BE THE FIRST</Link>}
        </div>
      ) : (
        <div>
          {page.map(entry => (
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
              <div className="caption" style={{ display: "flex", gap: "var(--sp-sm)", flexWrap: "wrap" }}>
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

          {/* Load more */}
          {hasMore && (
            <div style={{ textAlign: "center", padding: "var(--sp-lg) 0" }}>
              <button
                onClick={() => setVisible(v => v + PAGE_SIZE)}
                className="btn-outline"
                style={{ padding: "8px 32px" }}
              >
                LOAD MORE ({filtered.length - visible} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

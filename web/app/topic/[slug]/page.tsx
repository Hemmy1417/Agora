"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTopic, getTopicEntries, shortAddr, tierBadgeClass } from "@/lib/agora";
import type { Topic, Entry } from "@/lib/types";

export default function TopicPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [topic, setTopic]     = useState<Topic | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      getTopic(slug).then(setTopic),
      getTopicEntries(slug, 50).then(setEntries),
    ]).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="caption-upper">Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "var(--sp-xl) var(--sp-lg)" }}>
      <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>TOPIC</div>
      <h1 className="display-lg" style={{ marginBottom: "var(--sp-xxs)" }}>
        {topic?.display_name || slug}
      </h1>
      {topic && (
        <p className="caption" style={{ marginBottom: "var(--sp-lg)" }}>
          {topic.entry_count} {topic.entry_count === 1 ? "entry" : "entries"} · {topic.bounty_count} {topic.bounty_count === 1 ? "bounty" : "bounties"}
        </p>
      )}

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--sp-xxl) 0" }}>
          <p className="display-md" style={{ color: "var(--color-muted)", marginBottom: "var(--sp-sm)" }}>
            No entries for this topic.
          </p>
          <Link href="/submit" className="btn-primary">SUBMIT ONE</Link>
        </div>
      ) : (
        entries.map(entry => (
          <Link key={entry.entry_id} href={`/entry/${entry.entry_id}`}
            style={{
              display: "block", padding: "var(--sp-sm) 0",
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
              <span className="mono" style={{ fontSize: 13, color: "var(--color-muted)", marginLeft: "auto" }}>
                {entry.overall_score}/100
              </span>
            </div>
            <p className="body-sm" style={{ color: "var(--color-body)", maxWidth: 700 }}>
              {entry.summary.slice(0, 180)}{entry.summary.length > 180 ? "…" : ""}
            </p>
            <div className="caption" style={{ marginTop: 4 }}>
              {shortAddr(entry.owner)} · +{entry.reward} rep
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

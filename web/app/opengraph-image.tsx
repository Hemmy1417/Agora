import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Agora — Crowd-sourced Knowledge Database";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#181818",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="48" height="48" viewBox="0 0 100 100">
            <path d="M50 15 L12 38 L12 85 L50 68 Z" fill="#da291c" opacity="0.9" />
            <path d="M50 15 L88 38 L88 85 L50 68 Z" fill="#da291c" opacity="0.6" />
          </svg>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase" as const }}>
            AGORA
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 80, lineHeight: 1.05, letterSpacing: -2, fontWeight: 500, maxWidth: 900 }}>
            Knowledge that earns its place.
          </div>
          <div style={{ fontSize: 24, lineHeight: 1.4, color: "#969696", maxWidth: 700 }}>
            Submit research. AI validators verify it against the source. Earn reputation. Every entry on-chain.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 16, letterSpacing: 2 }}>
          <div style={{ display: "flex", gap: 20, color: "#969696" }}>
            <span>AI-verified</span>
            <span style={{ color: "#da291c" }}>·</span>
            <span>Crowd-sourced</span>
            <span style={{ color: "#da291c" }}>·</span>
            <span>On-chain</span>
          </div>
          <div style={{ color: "#da291c", letterSpacing: 4 }}>ON GENLAYER</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

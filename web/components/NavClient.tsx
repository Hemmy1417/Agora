"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet, formatAddr } from "@/lib/wallet";

export default function NavClient() {
  const { address, disconnect, busy } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!address) {
    return (
      <Link href="/auth" className="btn-primary" style={{ height: 36, padding: "8px 20px", fontSize: 12 }}>
        SIGN IN
      </Link>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="caption-upper"
        style={{
          background: "var(--color-canvas-elevated)",
          color: "var(--color-ink)",
          padding: "6px 14px",
          border: "1px solid var(--color-hairline)",
          cursor: "pointer",
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: 12,
          letterSpacing: "0.5px",
        }}
      >
        {formatAddr(address)}
      </button>

      {menuOpen && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 6px)",
          background: "var(--color-canvas-elevated)",
          border: "1px solid var(--color-hairline)",
          minWidth: 160,
          zIndex: 50,
        }}>
          <Link href="/profile" onClick={() => setMenuOpen(false)}
            style={{ display: "block", padding: "12px 16px", color: "var(--color-body)", fontSize: 13, textDecoration: "none" }}>
            Profile
          </Link>
          <hr className="divider" style={{ margin: 0 }} />
          <button
            onClick={() => { disconnect(); setMenuOpen(false); }}
            disabled={busy}
            style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "12px 16px", background: "transparent", border: "none",
              color: "var(--color-primary)", fontSize: 13, cursor: "pointer",
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

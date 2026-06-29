"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet, formatAddr } from "@/lib/wallet";

const NAV_LINKS = [
  { href: "/explore",     label: "Explore" },
  { href: "/submit",      label: "Submit" },
  { href: "/bounties",    label: "Bounties" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compliance",  label: "Compliance" },
];

export default function NavClient() {
  const { address, disconnect, busy } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* Hamburger — visible below sm */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Menu"
        className="mobile-only"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          marginLeft: "auto",
          marginRight: "var(--sp-xs)",
        }}
      >
        <span style={{ width: 22, height: 2, background: "var(--color-ink)", transition: "transform 0.2s", transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
        <span style={{ width: 22, height: 2, background: "var(--color-ink)", transition: "opacity 0.2s", opacity: mobileOpen ? 0 : 1 }} />
        <span style={{ width: 22, height: 2, background: "var(--color-ink)", transition: "transform 0.2s", transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
      </button>

      {/* Mobile drawer — portal to body to escape header stacking context */}
      {mobileOpen && typeof document !== "undefined" && createPortal(
        <div
          className="mobile-only"
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#181818",
            zIndex: 9999,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            padding: "var(--sp-lg)",
            gap: "var(--sp-sm)",
          }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              style={{ fontSize: 18, padding: "var(--sp-xs) 0", borderBottom: "1px solid var(--color-hairline)" }}
            >
              {label}
            </Link>
          ))}
          {address ? (
            <>
              <Link href="/profile" className="nav-link" style={{ fontSize: 18, padding: "var(--sp-xs) 0", borderBottom: "1px solid var(--color-hairline)" }}>
                Profile
              </Link>
              <button
                onClick={() => { disconnect(); setMobileOpen(false); }}
                disabled={busy}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--color-primary)", fontSize: 18, fontWeight: 600,
                  letterSpacing: "0.65px", textTransform: "uppercase", textAlign: "left",
                  padding: "var(--sp-xs) 0",
                }}
              >
                Disconnect
              </button>
            </>
          ) : (
            <Link href="/auth" className="btn-primary" style={{ marginTop: "var(--sp-sm)", textAlign: "center" }}>
              SIGN IN
            </Link>
          )}
        </div>,
        document.body
      )}

      {/* Desktop account button */}
      {!address ? (
        <Link href="/auth" className="btn-primary desktop-only" style={{ height: 36, padding: "8px 20px", fontSize: 12 }}>
          SIGN IN
        </Link>
      ) : (
        <div style={{ position: "relative" }} className="desktop-only">
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
      )}
    </>
  );
}

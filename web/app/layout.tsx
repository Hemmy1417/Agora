import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";
import { AgoraWordmark } from "@/components/Logo";
import NavClient from "@/components/NavClient";

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "700"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agora.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:       "AGORA — Crowd-sourced Knowledge Database",
  description: "Submit knowledge, get AI-verified, earn reputation. Every entry validated on-chain via GenLayer.",
  openGraph: {
    title:       "AGORA — Crowd-sourced Knowledge Database",
    description: "Submit knowledge, get AI-verified, earn reputation. On-chain via GenLayer.",
    url:         SITE_URL,
    siteName:    "Agora",
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AGORA — Crowd-sourced Knowledge Database",
    description: "Submit knowledge, get AI-verified, earn reputation.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <WalletProvider>
          {/* ── Top Nav: 64px, sharp, uppercase ── */}
          <header style={{
            height: 64,
            borderBottom: "1px solid var(--color-hairline)",
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(24,24,24,0.95)",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 var(--sp-lg)",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <AgoraWordmark />
              </Link>

              <nav style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", marginLeft: "var(--sp-lg)" }}
                className="hidden sm:flex">
                {[
                  { href: "/explore",     label: "Explore"     },
                  { href: "/submit",      label: "Submit"      },
                  { href: "/bounties",    label: "Bounties"    },
                  { href: "/leaderboard", label: "Leaderboard" },
                  { href: "/compliance",  label: "Compliance"  },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="nav-link">
                    {label}
                  </Link>
                ))}
              </nav>

              <NavClient />
            </div>
          </header>

          <main style={{ flex: 1 }}>{children}</main>

          {/* ── Footer: dark, understated ── */}
          <footer style={{
            borderTop: "1px solid var(--color-hairline)",
            padding: "var(--sp-xl) var(--sp-lg)",
          }}>
            <div style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span className="body-sm">Agora — Crowd-sourced Knowledge Database</span>
              <span className="body-sm">Powered by GenLayer</span>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}

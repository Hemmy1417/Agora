"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet";

type Mode = "login" | "signup";

export default function AuthPage() {
  const { address, signup, login, connect, wallets, busy } = useWallet();
  const router = useRouter();
  const [mode, setMode]         = useState<Mode>("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  useEffect(() => {
    if (address) router.replace("/");
  }, [address, router]);

  if (address) return null;

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") await signup(email, password);
      else await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  async function handleWallet(rdns?: string) {
    setError("");
    try {
      await connect(rdns);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--sp-xl) var(--sp-lg)",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="caption-upper" style={{ color: "var(--color-primary)", marginBottom: "var(--sp-xs)" }}>
          {mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
        </div>
        <h1 className="display-lg" style={{ marginBottom: "var(--sp-md)" }}>
          {mode === "signup" ? "Join the record." : "Welcome back."}
        </h1>

        {error && (
          <div style={{
            background: "rgba(241,58,44,0.1)", border: "1px solid var(--color-rejected)",
            padding: "var(--sp-xs)", marginBottom: "var(--sp-sm)", fontSize: 13, color: "var(--color-rejected)",
          }}>
            {error}
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xs)" }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="input" required
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            className="input" required minLength={6}
          />
          <button type="submit" className="btn-primary" disabled={busy} style={{ width: "100%" }}>
            {busy ? "PROCESSING…" : mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "var(--sp-sm) 0" }}>
          <button
            onClick={() => setMode(m => m === "login" ? "signup" : "login")}
            className="btn-ghost"
            style={{ fontSize: 12 }}
          >
            {mode === "login" ? "NEED AN ACCOUNT? SIGN UP" : "HAVE AN ACCOUNT? SIGN IN"}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--sp-xs)",
          margin: "var(--sp-sm) 0",
        }}>
          <hr className="divider" style={{ flex: 1 }} />
          <span className="caption-upper">OR</span>
          <hr className="divider" style={{ flex: 1 }} />
        </div>

        {/* Wallet connect */}
        {wallets.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xxs)" }}>
            {wallets.map(w => (
              <button
                key={w.rdns}
                onClick={() => handleWallet(w.rdns)}
                className="btn-outline"
                disabled={busy}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {w.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.icon} alt="" width={20} height={20} style={{ borderRadius: 4 }} />
                )}
                {w.name}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => handleWallet()}
            className="btn-outline"
            disabled={busy}
            style={{ width: "100%", justifyContent: "center" }}
          >
            CONNECT WALLET
          </button>
        )}

        <p className="caption" style={{ textAlign: "center", marginTop: "var(--sp-md)" }}>
          Email sign-up creates a blockchain wallet automatically.
          <br />Your private key can be exported from your profile.
        </p>
      </div>
    </div>
  );
}

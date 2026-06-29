"use client";

import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithCustomToken, signOut, onAuthStateChanged, type User,
} from "firebase/auth";
import { ethers } from "ethers";
import { createClient } from "genlayer-js";
import { getFirebaseAuth } from "./firebase";
import { API_URL, CHAIN, CHAIN_HEX, CHAIN_RPC, SIGN_MESSAGE } from "./config";

type AuthMethod = "email" | "injected" | null;

interface EIP6963Info { rdns: string; name: string; icon?: string }

interface WalletCtx {
  address:      string;
  client:       ReturnType<typeof createClient> | null;
  authMethod:   AuthMethod;
  firebaseUser: User | null;
  wallets:      EIP6963Info[];
  busy:         boolean;
  signup:       (email: string, password: string) => Promise<void>;
  login:        (email: string, password: string) => Promise<void>;
  connect:      (rdns?: string) => Promise<void>;
  disconnect:   () => Promise<void>;
  exportKey:    () => Promise<string>;
}

const Ctx = createContext<WalletCtx>({
  address: "", client: null, authMethod: null, firebaseUser: null,
  wallets: [], busy: false,
  signup: async () => {}, login: async () => {}, connect: async () => {},
  disconnect: async () => {}, exportKey: async () => "",
});

export function useWallet() { return useContext(Ctx); }

function makeEthersProvider(privateKey: string) {
  const rpc    = new ethers.JsonRpcProvider(CHAIN_RPC);
  const wallet = new ethers.Wallet(privateKey, rpc);
  return {
    request: async ({ method, params = [] }: { method: string; params?: unknown[] }) => {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [wallet.address];
        case "eth_chainId":
          return CHAIN_HEX;
        case "eth_sendTransaction": {
          const tx   = (params as Record<string, unknown>[])[0];
          const sent = await wallet.sendTransaction({
            to:       tx.to       as string,
            data:     tx.data     as string,
            value:    tx.value    as bigint | undefined,
            gasLimit: tx.gas      as string | undefined,
          });
          return sent.hash;
        }
        case "personal_sign": {
          const [msg] = params as string[];
          return wallet.signMessage(ethers.getBytes(msg));
        }
        default:
          return rpc.send(method, params as unknown[]);
      }
    },
    on: () => {},
    removeListener: () => {},
  };
}

function useEIP6963() {
  const [providers, setProviders] = useState<Map<string, { info: EIP6963Info; provider: unknown }>>(new Map());
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ info: EIP6963Info; provider: unknown }>;
      setProviders(prev => new Map(prev).set(ev.detail.info.rdns, ev.detail));
    };
    window.addEventListener("eip6963:announceProvider", handler as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => window.removeEventListener("eip6963:announceProvider", handler as EventListener);
  }, []);
  return providers;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const eip6963 = useEIP6963();
  const [address, setAddress]         = useState("");
  const [client, setClient]           = useState<ReturnType<typeof createClient> | null>(null);
  const [authMethod, setAuthMethod]   = useState<AuthMethod>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [busy, setBusy]               = useState(false);
  const rdnsRef = useRef("");

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), u => setFirebaseUser(u)), []);

  const wallets: EIP6963Info[] = Array.from(eip6963.values()).map(v => v.info);

  async function getIdToken(): Promise<string> {
    if (!firebaseUser) throw new Error("Not signed in");
    return firebaseUser.getIdToken();
  }

  async function apiPost(path: string, body?: object, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API error");
    return data;
  }

  function buildEmailClient(addr: string, pk: string) {
    return createClient({ chain: CHAIN, account: addr as `0x${string}`, provider: makeEthersProvider(pk) } as Parameters<typeof createClient>[0]);
  }

  function buildInjectedClient(addr: string, provider: unknown) {
    return createClient({ chain: CHAIN, account: addr as `0x${string}`, provider } as Parameters<typeof createClient>[0]);
  }

  const signup = useCallback(async (email: string, password: string) => {
    setBusy(true);
    try {
      const cred  = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      const token = await cred.user.getIdToken();
      const { address: addr } = await apiPost("/wallet/create", {}, token);
      const { privateKey }    = await apiPost("/wallet/export", {}, token);
      setAddress(addr); setClient(buildEmailClient(addr, privateKey)); setAuthMethod("email");
    } finally { setBusy(false); }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setBusy(true);
    try {
      const cred  = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const token = await cred.user.getIdToken();
      const { address: addr } = await apiPost("/wallet/create", {}, token);
      const { privateKey }    = await apiPost("/wallet/export", {}, token);
      setAddress(addr); setClient(buildEmailClient(addr, privateKey)); setAuthMethod("email");
    } finally { setBusy(false); }
  }, []);

  const connect = useCallback(async (rdns?: string) => {
    setBusy(true);
    try {
      const target = rdns ? eip6963.get(rdns) : eip6963.values().next().value;
      if (!target) throw new Error("No wallet found");
      const provider = target.provider as { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };

      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_HEX }] });
      } catch {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: CHAIN_HEX, chainName: "Genlayer Studio Network", rpcUrls: [CHAIN_RPC], nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 } }],
          });
        } catch {}
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
      const addr = accounts[0];
      const hexMsg = ethers.hexlify(ethers.toUtf8Bytes(SIGN_MESSAGE));
      const sig = await provider.request({ method: "personal_sign", params: [hexMsg, addr] }) as string;
      const { customToken } = await apiPost("/auth/wallet", { address: addr, signature: sig });
      await signInWithCustomToken(getFirebaseAuth(), customToken);

      rdnsRef.current = target.info.rdns;
      setAddress(addr); setClient(buildInjectedClient(addr, provider)); setAuthMethod("injected");
    } finally { setBusy(false); }
  }, [eip6963]);

  const disconnect = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setAddress(""); setClient(null); setAuthMethod(null); rdnsRef.current = "";
  }, []);

  const exportKey = useCallback(async (): Promise<string> => {
    const token = await getIdToken();
    const { privateKey } = await apiPost("/wallet/export", {}, token);
    return privateKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  return (
    <Ctx.Provider value={{ address, client, authMethod, firebaseUser, wallets, busy, signup, login, connect, disconnect, exportKey }}>
      {children}
    </Ctx.Provider>
  );
}

export function formatAddr(a: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
}

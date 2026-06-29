import { studionet } from "genlayer-js/chains";

export const CHAIN     = studionet;
export const CHAIN_HEX = `0x${studionet.id.toString(16)}` as `0x${string}`;
export const CHAIN_RPC = studionet.rpcUrls.default.http[0];

export const CONTRACT_ADDRESS  = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xDeBa41B6873088b9c82e85c3c272371D54F69347") as `0x${string}`;
export const CONTRACT_CONFIGURED = /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

if (typeof window !== "undefined") {
  console.log("[AGORA] Contract:", CONTRACT_ADDRESS);
  console.log("[AGORA] API:", API_URL);
}

export const EXPLORER_URL = (studionet.blockExplorers?.default?.url || "").replace(/\/$/, "");

export function explorerTxUrl(hash: string): string {
  if (!EXPLORER_URL || !hash) return "";
  return `${EXPLORER_URL}/tx/${hash}`;
}

export const SIGN_MESSAGE = "Sign in to AGORA";

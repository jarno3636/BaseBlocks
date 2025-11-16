// lib/mini.ts
"use client";

/**
 * High-level Mini helpers for React code to import from.
 * We re-export the canonical low-level pieces from miniapp.ts.
 */

import {
  SITE_URL,
  MINIAPP_URL,
  isFarcasterUA,
  isBaseAppUA,
  buildFarcasterComposeUrl,
  fcPreferMini,
  ensureReady,
  getMiniSdk,
  openInMini,
  composeCast,
  isInsideMini, // <- canonical detector (re-exported)
} from "./miniapp";

/** Alias some places call `insideMini()` directly */
export const insideMini = isInsideMini;

/** Signal “ready” to Farcaster/Base so splash doesn’t hang */
export async function miniReady(timeoutMs = 1200): Promise<void> {
  // Farcaster SDK
  await ensureReady(timeoutMs);

  // Base MiniKit (if present)
  try {
    const w = window as any;
    const mk = w?.miniKit || w?.coinbase?.miniKit || null;
    if (mk?.setFrameReady) await Promise.resolve(mk.setFrameReady());
  } catch {
    /* ignore */
  }
}

/** Best-effort FID detection (URL param ➜ MiniKit context ➜ SDK ➜ storage) */
export async function currentFid(): Promise<number | null> {
  if (typeof window === "undefined") return null;

  // 1) URL ?fid=123
  try {
    const p = new URLSearchParams(window.location.search);
    const q = p.get("fid");
    if (q && /^\d+$/.test(q)) return Number(q);
  } catch {}

  // 2) Base MiniKit globals
  try {
    const w = window as any;
    const mk = w?.miniKit || w?.coinbase?.miniKit || w?.MiniKit || null;
    const mkFid = mk?.user?.fid ?? mk?.context?.user?.fid;
    const n = Number(mkFid);
    if (Number.isFinite(n) && n > 0) return n;
  } catch {}

  // 3) Farcaster MiniApp SDK context
  try {
    const sdk = await getMiniSdk();
    const raw = (sdk as any)?.user?.fid ?? (sdk as any)?.context?.user?.fid ?? null;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  } catch {}

  // 4) Storage fallback
  try {
    const ls = localStorage.getItem("fid") || sessionStorage.getItem("fid");
    const n = Number(ls);
    if (Number.isFinite(n) && n > 0) return n;
  } catch {}

  return null;
}

/** Open a user’s Farcaster profile (FID) in the native host when possible */
export async function openProfile(fid?: number | null): Promise<void> {
  if (!fid) return;
  // Correct path is plural: /~/profiles/<fid>
  const url = `https://warpcast.com/~/profiles/${fid}`;
  const handled = await openInMini(url);
  if (!handled && typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}

/** Open any URL via Mini host first; fallback to web */
export async function openUrl(url: string): Promise<void> {
  const handled = await openInMini(url);
  if (!handled && typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}

/** Simple sign-in launcher (optional route) */
export async function miniSignin(): Promise<void> {
  const loginUrl = `${SITE_URL}/login`;
  await openUrl(loginUrl);
}

/** Re-exports for convenience */
export {
  SITE_URL,
  MINIAPP_URL,
  isFarcasterUA,
  isBaseAppUA,
  buildFarcasterComposeUrl,
  fcPreferMini,
  ensureReady,
  getMiniSdk,
  openInMini,
  composeCast,
};

// lib/fid.ts
"use client";

export function tryDetectFIDFromEnvironment(): number | null {
  if (typeof window === "undefined") return null;

  // 1) URL params
  try {
    const sp = new URLSearchParams(window.location.search);
    for (const k of ["fid", "viewerFid", "userFid"]) {
      const v = sp.get(k);
      if (v && /^\d+$/.test(v)) return Number(v);
    }
  } catch {}

  // 2) Mini/Farcaster contexts (best-effort)
  try {
    const w: any = window;
    const candidates = [
      w?.MiniKit?.context?.user?.fid,
      w?.farcaster?.session?.fid,
      w?.frame?.context?.user?.fid,
      w?.__FC__?.viewerFid,
    ];
    for (const c of candidates) {
      if (typeof c === "number" && c > 0) return c;
      if (typeof c === "string" && /^\d+$/.test(c)) return Number(c);
    }
  } catch {}

  // 3) Last known
  try {
    const last = localStorage.getItem("basebots.fid");
    if (last && /^\d+$/.test(last)) return Number(last);
  } catch {}

  return null;
}

export function detectedFIDString(): string {
  const n = tryDetectFIDFromEnvironment();
  return typeof n === "number" && Number.isFinite(n) ? String(n) : "";
}

export function rememberFID(fid: string | number) {
  try {
    const s = String(fid ?? "").trim();
    if (/^\d+$/.test(s)) localStorage.setItem("basebots.fid", s);
  } catch {}
}

/** Optional convenience: detect and persist in one call. */
export function detectAndRememberFID(): number | null {
  const n = tryDetectFIDFromEnvironment();
  if (typeof n === "number" && Number.isFinite(n) && n > 0) {
    rememberFID(n);
    return n;
  }
  return null;
}

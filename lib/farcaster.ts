// lib/farcaster.ts
export function isFarcasterUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Warpcast|Farcaster|FarcasterMini/i.test(navigator.userAgent || "");
}

/** Accept fid from query (?fid=123) as a robust fallback */
export function fidFromQuery(): number | null {
  if (typeof window === "undefined") return null;
  const u = new URL(window.location.href);
  const f = u.searchParams.get("fid");
  const n = f ? Number(f) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

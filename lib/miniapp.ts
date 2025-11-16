/** Low-level Farcaster/Base Mini interop (no React hooks) */

type MiniAppSdk = {
  actions?: {
    openUrl?: (url: string | { url: string }) => Promise<void> | void;
    openURL?: (url: string) => Promise<void> | void; // legacy
    composeCast?: (args: { text?: string; embeds?: string[] }) => Promise<void> | void;
    ready?: () => Promise<void> | void;
  };
  isInMiniApp?: () => boolean;
  user?: { fid?: number | string };
  context?: { user?: { fid?: number | string } };
};

/* ---------------- Env helpers ---------------- */

export const SITE_URL =
  (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_SITE_URL) ||
  "https://tamabot.vercel.app";

export const MINIAPP_URL =
  (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_FC_MINIAPP_URL) ||
  "";

/* ---------------- UA heuristics ---------------- */

export function isFarcasterUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Warpcast|Farcaster|FarcasterMini/i.test(navigator.userAgent);
}

export function isBaseAppUA(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /BaseWallet|Base\sApp|Base\/\d|CoinbaseWallet|CoinbaseMobile|CoinbaseApp|CBBrowser|CBWallet|Coinbase(Android|iOS)?/i.test(
    ua
  );
}

/** Broad “inside mini” detector: Farcaster UA, iframe, or MiniKit present */
export function isInsideMini(): boolean {
  if (typeof window === "undefined") return false;
  const uaYes = isFarcasterUA();
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const w: any = window as any;
  const hasMiniKit = !!(w?.miniKit || w?.coinbase?.miniKit || w?.MiniKit);
  return uaYes || inIframe || hasMiniKit;
}

/* ---------------- URL helpers ---------------- */

function toAbsoluteUrl(input: string, base = SITE_URL): string {
  try {
    return new URL(input, base).toString();
  } catch {
    try {
      return new URL(base).toString();
    } catch {
      return "https://tamabot.vercel.app";
    }
  }
}

/** Prefer Mini App URL inside Farcaster; else normal site (absolute). */
export function fcPreferMini(pathOrAbs = ""): string {
  const base = isFarcasterUA() && MINIAPP_URL ? MINIAPP_URL : SITE_URL;
  const absBase = toAbsoluteUrl(base);
  if (!pathOrAbs) return absBase;
  if (/^https?:\/\//i.test(pathOrAbs)) return pathOrAbs;
  const sep = pathOrAbs.startsWith("/") ? "" : "/";
  return `${absBase}${sep}${pathOrAbs}`;
}

/* ---------------- Farcaster composer helpers ---------------- */

export function buildFarcasterComposeUrl({
  text = "",
  embeds = [] as string[],
}: {
  text?: string;
  embeds?: string[];
} = {}): string {
  const url = new URL("https://warpcast.com/~/compose");
  if (text) url.searchParams.set("text", text);
  for (const e of embeds || []) {
    const abs = e ? toAbsoluteUrl(e, SITE_URL) : "";
    if (abs) url.searchParams.append("embeds[]", abs);
  }
  return url.toString();
}

/* ---------------- SDK loaders ---------------- */

/** FIXED VERSION — safe dynamic import without TS conflicts */
export async function getMiniSdk(): Promise<MiniAppSdk | null> {
  if (typeof window === "undefined") return null;

  try {
    // Looser type to avoid TS structural mismatch errors
    const imported: any = await import("@farcaster/miniapp-sdk");

    // Support both "sdk" and "default" exports
    const fromModule = imported?.sdk ?? imported?.default;
    if (fromModule) return fromModule as MiniAppSdk;

    // Global fallback
    const g = window as any;
    return (g?.farcaster?.miniapp?.sdk || g?.sdk || null) as MiniAppSdk | null;
  } catch {
    const g = window as any;
    return (g?.farcaster?.miniapp?.sdk || g?.sdk || null) as MiniAppSdk | null;
  }
}

/** Call sdk.actions.ready() quickly so we never hang splash */
export async function ensureReady(timeoutMs = 1200): Promise<void> {
  try {
    const sdk = await getMiniSdk();
    if (!sdk?.actions?.ready) return;
    await Promise.race<void>([
      Promise.resolve(sdk.actions.ready()),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  } catch {}
}

/* ===================== Base App (MiniKit globals) ===================== */

function getMiniKit(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w?.miniKit || w?.coinbase?.miniKit || w?.MiniKit || null;
}

async function tryBaseComposeCast(args: { text?: string; embeds?: string[] }) {
  if (!isBaseAppUA()) return false;
  try {
    const mk = getMiniKit();
    if (mk?.composeCast) {
      await mk.composeCast(args);
      return true;
    }
  } catch {}
  return false;
}

/** Try to open a URL natively (Base MiniKit ➜ Farcaster SDK), else let caller fall back to web */
export async function openInMini(url: string): Promise<boolean> {
  if (!url) return false;
  const safe = toAbsoluteUrl(url, SITE_URL);

  // 1) Base App MiniKit
  try {
    const mk = getMiniKit();
    if (mk?.openUrl) {
      await mk.openUrl(safe);
      return true;
    }
    if (mk?.openURL) {
      await mk.openURL(safe);
      return true;
    }
  } catch {}

  // 2) Farcaster Mini App SDK (Warpcast)
  try {
    const sdk = await getMiniSdk();
    if (sdk?.actions?.openUrl) {
      try {
        await sdk.actions.openUrl(safe);
        return true;
      } catch {
        await (sdk.actions.openUrl as any)({ url: safe });
        return true;
      }
    }
    if (sdk?.actions?.openURL) {
      await sdk.actions.openURL(safe);
      return true;
    }
  } catch {}

  // 3) Not handled
  return false;
}

/** Convenience: open a url via native if possible, else new tab */
export async function openUrl(url: string): Promise<void> {
  const ok = await openInMini(url);
  if (!ok && typeof window !== "undefined") window.open(url, "_blank");
}

/** Unified compose helper (Base App ➜ Warpcast SDK ➜ fail) */
export async function composeCast({
  text = "",
  embeds = [] as string[],
} = {}): Promise<boolean> {
  const normalizedEmbeds = (embeds || []).map((e) => toAbsoluteUrl(e, SITE_URL));

  // Base MiniKit
  if (await tryBaseComposeCast({ text, embeds: normalizedEmbeds })) return true;

  // Farcaster SDK
  const sdk = await getMiniSdk();
  if (sdk?.actions?.composeCast && isFarcasterUA()) {
    try {
      await ensureReady();
      await sdk.actions.composeCast({ text, embeds: normalizedEmbeds });
      return true;
    } catch {}
  }

  return false;
}

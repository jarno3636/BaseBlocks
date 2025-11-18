// components/ShareToFarcaster.tsx
"use client";

type Props = {
  text?: string;
  /** Absolute or relative URL to embed (image or page). */
  url?: string;
  className?: string;
};

function getSiteOrigin(): string {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_URL;

  if (env) {
    // If user put full URL in env, don’t double-prefix
    if (env.startsWith("http://") || env.startsWith("https://")) {
      return env.replace(/\/$/, "");
    }
    return `https://${env.replace(/\/$/, "")}`;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://baseblox.vercel.app";
}

function toAbs(u?: string): string {
  if (!u) return "";
  try {
    if (/^https?:\/\//i.test(u)) return u;
    const base = getSiteOrigin();
    return new URL(u, base).toString();
  } catch {
    return "";
  }
}

export default function ShareToFarcaster({ text = "", url, className = "" }: Props) {
  const click = async () => {
    // Prefer provided URL (image/page), else env/home
    const embed = toAbs(
      url ||
        process.env.NEXT_PUBLIC_FC_MINIAPP_LINK ||
        process.env.NEXT_PUBLIC_URL ||
        "/"
    );

    // 1) Coinbase/Base MiniKit (if present)
    try {
      const w = globalThis as any;
      const mk = w?.miniKit || w?.coinbase?.miniKit || w?.MiniKit || null;
      if (mk?.composeCast) {
        await Promise.resolve(mk.composeCast({ text, embeds: embed ? [embed] : [] }));
        return;
      }
    } catch {}

    // 2) Farcaster MiniApp SDK (Warpcast)
    try {
      const mod: any = await import("@farcaster/miniapp-sdk").catch(() => null);
      const sdk: any = mod?.sdk ?? mod?.default ?? null;

      if (sdk?.actions?.composeCast) {
        try {
          await Promise.race([
            Promise.resolve(sdk.actions.ready?.()),
            new Promise((r) => setTimeout(r, 500)),
          ]);
        } catch {}
        await Promise.resolve(
          sdk.actions.composeCast({ text, embeds: embed ? [embed] : [] })
        );
        return;
      }

      if (sdk?.actions?.openUrl || sdk?.actions?.openURL) {
        const u = new URL("https://warpcast.com/~/compose");
        if (text) u.searchParams.set("text", text);
        if (embed) u.searchParams.append("embeds[]", embed);
        try {
          await Promise.resolve(sdk.actions.openUrl?.(u.toString()));
        } catch {
          await Promise.resolve(sdk.actions.openURL?.(u.toString()));
        }
        return;
      }
    } catch {}

    // 3) Web fallback
    const u = new URL("https://warpcast.com/~/compose");
    if (text) u.searchParams.set("text", text);
    if (embed) u.searchParams.append("embeds[]", embed);
    window.open(u.toString(), "_top", "noopener,noreferrer");
  };

  return (
    <button
      onClick={click}
      className={[
        "rounded-xl px-4 py-2 font-semibold",
        "bg-[#8a66ff] hover:bg-[#7b58ef] border border-white/20",
        "shadow-[0_10px_24px_rgba(0,0,0,.35)]",
        className,
      ].join(" ")}
    >
      Share on Farcaster
    </button>
  );
}

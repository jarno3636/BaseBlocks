// components/ShareToFarcaster.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text?: string;
  /** Image URL to embed in the cast. */
  url?: string;
  className?: string;
};

function getOrigin(): string {
  // Prefer runtime origin when in the browser
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  const env =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "";
  if (env) {
    const withProto = /^https?:\/\//i.test(env) ? env : `https://${env}`;
    return withProto.replace(/\/$/, "");
  }

  return "https://baseblox.vercel.app";
}

function toAbs(u?: string): string {
  if (!u) return "";
  try {
    if (/^https?:\/\//i.test(u)) return u;
    const base = getOrigin();
    return new URL(u, base).toString();
  } catch {
    return "";
  }
}

export default function ShareToFarcaster({
  text = "",
  url,
  className = "",
}: Props) {
  // We always have at least a fallback image.
  const isDisabled = false;

  const onClick = async () => {
    if (isDisabled) return;

    // Only ever embed an *image* URL (no app/OG pages).
    const embedUrl = toAbs(url || "/share.PNG");

    // For SDK: [] | [string]
    const embedsForSdk: [] | [string] = embedUrl ? [embedUrl] : [];

    // 1) Mini App SDK composeCast
    try {
      await sdk.actions.composeCast({
        text,
        embeds: embedsForSdk,
      });
      return;
    } catch {
      // fall through to web fallback
    }

    // 2) Web fallback – Warpcast composer
    try {
      const u = new URL("https://warpcast.com/~/compose");
      if (text) u.searchParams.set("text", text);
      if (embedUrl) u.searchParams.append("embeds[]", embedUrl);
      window.open(u.toString(), "_blank", "noopener,noreferrer");
    } catch {
      window.location.href = "https://warpcast.com/~/compose";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "rounded-xl px-4 py-2 text-sm font-semibold",
        isDisabled
          ? "bg-slate-900/60 border border-slate-700 text-slate-500 cursor-not-allowed"
          : "bg-[#8a66ff] hover:bg-[#7b58ef] border border-white/20 shadow-[0_10px_24px_rgba(0,0,0,.35)]",
        "transition-colors",
        className,
      ].join(" ")}
    >
      Share on Farcaster
    </button>
  );
}

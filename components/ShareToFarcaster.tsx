// components/ShareToFarcaster.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text?: string;
  /** URL to embed in the cast (image or page). */
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
  // If you want: treat “no url + no default” as disabled
  // Right now we always fall back to /share.PNG, so this is always false.
  // Flip this logic if you ever want a real disabled state.
  const isDisabled = false;

  const onClick = async () => {
    if (isDisabled) return;

    // Default to the global share image if nothing else is provided
    const embedUrl = toAbs(url || "/share.PNG");

    // 1) Mini App SDK composeCast (inside mini-app)
    try {
      await sdk.actions.composeCast({
        text,
        embeds: embedUrl ? [embedUrl] : [],
      });
      return;
    } catch {
      // fall through to web fallback
    }

    // 2) Web fallback – open Warpcast composer with query params
    try {
      const u = new URL("https://warpcast.com/~/compose");
      if (text) u.searchParams.set("text", text);
      if (embedUrl) u.searchParams.append("embeds[]", embedUrl);
      window.open(u.toString(), "_blank", "noopener,noreferrer");
    } catch {
      // As a last resort, just navigate
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

// components/ShareToFarcaster.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text?: string;
  /** Primary URL to embed (image or page). */
  url?: string;
  /** Optional second embed (e.g. mini-app link). */
  secondaryUrl?: string;
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
  secondaryUrl,
  className = "",
}: Props) {
  // Right now we always have a fallback image, so this stays false.
  const isDisabled = false;

  const onClick = async () => {
    if (isDisabled) return;

    // Build embed list: primary + optional secondary.
    const embeds: string[] = [];
    let primary = toAbs(url);
    let secondary = toAbs(secondaryUrl);

    // If nothing valid, fall back to global share image.
    if (!primary && !secondary) {
      primary = toAbs("/share.PNG");
    }

    if (primary) embeds.push(primary);
    if (secondary) embeds.push(secondary);

    // For the mini-app SDK we must pass [] | [string] | [string, string]
    const embedsForSdk =
      embeds.length === 0
        ? undefined
        : (embeds as [string] | [string, string]);

    // 1) Mini App SDK composeCast (inside mini-app)
    try {
      if (embedsForSdk) {
        await sdk.actions.composeCast({
          text,
          embeds: embedsForSdk,
        });
      } else {
        await sdk.actions.composeCast({ text });
      }
      return;
    } catch {
      // fall through to web fallback
    }

    // 2) Web fallback – open Warpcast composer with query params
    try {
      const u = new URL("https://warpcast.com/~/compose");
      if (text) u.searchParams.set("text", text);
      for (const e of embeds) {
        u.searchParams.append("embeds[]", e);
      }
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

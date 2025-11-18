// components/ShareToFarcaster.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text?: string;
  /** Primary URL to embed (image or page). */
  url?: string;
  /** Optional second URL to embed (e.g. mini-app link). */
  extraUrl?: string;
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
  text,
  url,
  extraUrl,
  className,
}: Props) {
  const handleClick = () => {
    const embeds: { url: string }[] = [];

    if (url) embeds.push({ url: toAbs(url) });
    if (extraUrl) embeds.push({ url: toAbs(extraUrl) });

    sdk.actions.openShareSheet({
      text: text ?? "",
      embeds,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-900/80 border border-white/20 text-slate-50 hover:bg-slate-800/90 transition"
      }
    >
      Share on Farcaster
    </button>
  );
}

// components/ShareToFarcaster.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text: string;
  /** URL to embed in the cast (image or page). */
  url?: string;
  className?: string;
};

function getOrigin(): string {
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

export default function ShareToFarcaster({ text, url, className }: Props) {
  async function handleClick() {
    const absUrl = toAbs(url);

    // 1) Mini-app native share if available
    try {
      if (sdk?.actions?.openCastComposer) {
        await sdk.actions.openCastComposer({
          // body of the cast
          text,
          // Warpcast expects embeds as URLs
          embeds: absUrl ? [absUrl] : [],
        });
        return;
      }
    } catch {
      // fall through to Warpcast URL share
    }

    // 2) Fallback: Warpcast web composer
    const params = new URLSearchParams();
    if (text) params.set("text", text);
    if (absUrl) params.append("embeds[]", absUrl);

    const targetUrl = `https://warpcast.com/~/compose?${params.toString()}`;

    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium " +
          "bg-violet-500/20 border border-violet-400/70 text-violet-50 hover:bg-violet-500/30 " +
          "transition"
      }
    >
      Share on Farcaster
    </button>
  );
}

// components/ShareToFarcaster.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text: string;
  /** Primary URL to embed in the cast (image or page). */
  url?: string;
  /** Optional second URL (e.g. mini-app link) to embed as well. */
  secondaryUrl?: string;
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

export default function ShareToFarcaster({
  text,
  url,
  secondaryUrl,
  className,
}: Props) {
  async function handleClick() {
    const primary = toAbs(url);
    const secondary = toAbs(secondaryUrl);

    // 👇 Tuple for composeCast (what the types expect)
    let embedsTuple: [] | [string] | [string, string] | undefined;
    if (primary && secondary) {
      embedsTuple = [primary, secondary];
    } else if (primary) {
      embedsTuple = [primary];
    } else if (secondary) {
      embedsTuple = [secondary];
    } else {
      embedsTuple = undefined;
    }

    // 👇 Plain array for building the Warpcast URL
    const embedList = [primary, secondary].filter(Boolean) as string[];

    // 1) Preferred: native composeCast inside Base / Farcaster host
    try {
      await sdk.actions.composeCast({
        text,
        embeds: embedsTuple,
      });
      return;
    } catch {
      // If we're not in a mini app host or composeCast isn't supported,
      // fall through to openUrl below.
    }

    // 2) Fallback: open Warpcast composer via SDK navigation
    const params = new URLSearchParams();
    if (text) params.set("text", text);
    embedList.forEach((u) => params.append("embeds[]", u));

    const warpcastUrl = `https://warpcast.com/~/compose?${params.toString()}`;

    try {
      await sdk.actions.openUrl(warpcastUrl);
      return;
    } catch {
      // 3) Last-ditch fallback in plain browser
      if (typeof window !== "undefined") {
        window.open(warpcastUrl, "_blank", "noopener,noreferrer");
      }
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

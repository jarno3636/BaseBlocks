// components/ShareToFarcaster.tsx
"use client";

import type { ReactNode } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text: string;
  /** Primary URL to embed in the cast (image or page). */
  url?: string;
  /** Optional second URL (e.g. mini-app link) to embed as well. */
  secondaryUrl?: string;
  className?: string;
  /** Optional custom button contents. */
  children?: ReactNode;
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
  children,
}: Props) {
  async function handleClick() {
    const primary = toAbs(url);
    const secondary = toAbs(secondaryUrl);

    // Tuple type that matches composeCast embeds
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

    // Plain array for building Warpcast URL
    const embedList = [primary, secondary].filter(Boolean) as string[];

    // Build Warpcast composer URL (works in any browser / host)
    const params = new URLSearchParams();
    if (text) params.set("text", text);
    embedList.forEach((u) => params.append("embeds[]", u));
    const warpcastUrl = `https://warpcast.com/~/compose?${params.toString()}`;

    // 1) If host *explicitly* supports composeCast, use it (Warpcast native UX)
    try {
      const capabilities = (await (sdk as any)?.getCapabilities?.()) as
        | string[]
        | undefined;

      const supportsCompose = Array.isArray(capabilities)
        ? capabilities.includes("actions.composeCast")
        : false;

      if (supportsCompose) {
        await sdk.actions.composeCast({
          text,
          embeds: embedsTuple,
        });
        return;
      }
    } catch {
      // Ignore and fall through to openUrl fallback.
    }

    // 2) Fallback: use openUrl via the SDK (Base app & Warpcast both understand this)
    try {
      // openUrl accepts either a string or an object; string is fine here
      await sdk.actions.openUrl(warpcastUrl);
      return;
    } catch {
      // continue to last-resort browser fallback
    }

    // 3) Last fallback: plain browser navigation (window.open can be blocked in WebViews)
    if (typeof window !== "undefined") {
      try {
        // Prefer same-tab navigation to avoid popup blocking
        window.location.href = warpcastUrl;
      } catch {
        // Very last resort: try a popup
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
      {children ?? <span>Share on Farcaster</span>}
    </button>
  );
}

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
    const embeds = [primary, secondary].filter(Boolean) as string[];

    // Build Warpcast compose URL once for fallbacks
    const params = new URLSearchParams();
    if (text) params.set("text", text);
    embeds.forEach((u) => params.append("embeds[]", u));
    const warpcastComposeUrl = `https://warpcast.com/~/compose?${params.toString()}`;

    try {
      // 1) Detect capabilities if we're in a mini app host
      const capabilities = (await sdk.getCapabilities?.()) ?? [];

      const supportsCompose = capabilities.includes("actions.composeCast");
      const supportsOpenUrl = capabilities.includes("actions.openUrl");

      // 1a) Preferred: native cast composer
      if (supportsCompose) {
        await sdk.actions.composeCast({
          text,
          embeds,
        });
        return;
      }

      // 1b) Fallback inside client: open compose URL in-app
      if (supportsOpenUrl) {
        await sdk.actions.openUrl(warpcastComposeUrl);
        return;
      }
    } catch {
      // If SDK/capabilities fail, we'll fall through to browser fallback
    }

    // 2) Final fallback: normal browser behavior
    if (typeof window !== "undefined") {
      window.open(warpcastComposeUrl, "_blank", "noopener,noreferrer");
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

// components/ShareToFarcaster.tsx
"use client";

import { useComposeCast } from "@coinbase/onchainkit/minikit";

type Props = {
  text?: string;
  /** Primary embed – usually the NFT image URL */
  url?: string;
  /** Secondary embed – usually the mini-app/page URL */
  secondaryUrl?: string;
  className?: string;
};

function getOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_URL ||
    "https://baseblox.vercel.app";

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

function toAbs(u?: string): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  const base = getOrigin();
  try {
    return new URL(u, base).toString();
  } catch {
    return undefined;
  }
}

export default function ShareToFarcaster({
  text,
  url,
  secondaryUrl,
  className,
}: Props) {
  const { composeCast, canCompose } = useComposeCast();

  const handleClick = () => {
    const primary = toAbs(url);
    const secondary = toAbs(secondaryUrl);

    const embedsArray: string[] = [];
    if (primary) embedsArray.push(primary);
    if (secondary && secondary !== primary) embedsArray.push(secondary);

    const message = text || "";

    // MiniKit expects: [] | [string] | [string, string]
    type EmbedsTuple = [] | [string] | [string, string];
    let embeds: EmbedsTuple = [];
    if (embedsArray.length === 1) embeds = [embedsArray[0]];
    else if (embedsArray.length >= 2) embeds = [embedsArray[0], embedsArray[1]];

    // ✅ Inside Base / mini app
    if (canCompose && composeCast) {
      composeCast({ text: message, embeds });
      return;
    }

    // 🌐 Fallback: open Warpcast composer on web
    const params = new URLSearchParams();
    if (message) params.set("text", message);
    (embeds as string[]).forEach((e) => params.append("embeds[]", e));

    const href = `https://warpcast.com/~/compose?${params.toString()}`;

    if (typeof window !== "undefined") {
      window.open(href, "_blank");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold " +
        "bg-sky-500/15 border border-sky-400/80 text-sky-50 hover:bg-sky-500/30 " +
        "transition shadow-[0_10px_24px_rgba(8,47,73,.55)]"
      }
    >
      <span className="text-[10px]">◆</span>
      <span>Share on Farcaster</span>
    </button>
  );
}

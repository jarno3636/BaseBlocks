// components/ShareToFarcaster.tsx
"use client";

import { sdk } from "@farcaster/miniapp-sdk";

type Props = {
  text?: string;
  url?: string;          // primary (image)
  secondaryUrl?: string; // secondary (mini-app)
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
  const handleClick = () => {
    const primary = toAbs(url);
    const secondary = toAbs(secondaryUrl);

    const embeds: { url: string }[] = [];
    if (primary) embeds.push({ url: primary });
    if (secondary) embeds.push({ url: secondary });

    sdk.actions.openShare({
      text: text || "",
      embeds,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-900/80 border border-white/20 text-slate-50 hover:bg-slate-800/90 transition shadow-[0_10px_24px_rgba(0,0,0,.35)]"
      }
    >
      Share on Farcaster
    </button>
  );
}

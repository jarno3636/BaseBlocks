// components/ShareSection.tsx
"use client";

import ShareToFarcaster from "./ShareToFarcaster";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
  primarySymbol: string;
  cubeImageUrl?: string; // optional NFT image URL from tokenURI
};

function getSiteOrigin(): string {
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

// Prefer the registered mini-app URL if set, else fall back to the web origin.
function getAppShareUrl(): string {
  const mini = process.env.NEXT_PUBLIC_MINIAPP_URL;
  if (mini && mini.trim()) {
    return mini.replace(/\/$/, "");
  }
  return getSiteOrigin();
}

function getCubeUrl(cubeId: number): string {
  const base = getAppShareUrl();
  // For mini-app, you can read this query param inside your app if you want.
  return `${base}?cubeId=${cubeId}`;
}

function openTwitterShare(text: string, url?: string) {
  const params = new URLSearchParams();
  if (text) params.set("text", text);
  if (url) params.set("url", url);

  const shareUrl = `https://x.com/intent/post?${params.toString()}`;

  if (typeof window !== "undefined") {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }
}

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
  primarySymbol,
  cubeImageUrl,
}: ShareSectionProps) {
  const appShareUrl = getAppShareUrl();
  const cubeUrl = hasCube ? getCubeUrl(cubeId) : appShareUrl;
  const nftImageUrl = cubeImageUrl; // may be undefined

  const cubeShareText = hasCube
    ? `My BaseBlox identity cube #${cubeId} on Base – ${ageDays} days old, ${prestigeLabelText}${
        primarySymbol ? `, primary token ${primarySymbol}` : ""
      }.`
    : "Mint your BaseBlox identity cube on Base.";

  const appShareText =
    "BaseBlox – evolving onchain identity cubes on Base. One cube per wallet, tracking age, prestige, and your primary token.";

  return (
    <div className="glass-card px-4 py-4 sm:px-5 sm:py-5 space-y-5">
      <div className="flex flex-col items-center gap-1">
        <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
          Share
        </p>
        <p className="text-xs text-slate-300/90 max-w-xs">
          Cast your cube or the app itself and let Base know what you&apos;re
          cooking.
        </p>
      </div>

      {/* Share your cube */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 px-4 py-4 space-y-3 shadow-inner shadow-slate-900/70">
        <div className="flex flex-col items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-100">
            <span className="text-xs">🔷</span>
            Your cube
          </span>
          <p className="text-xs text-slate-300/90">
            Post your current cube stats with embeds that link straight back.
          </p>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:justify-center gap-2.5">
          {/* Farcaster share for cube:
              - primary embed: NFT image (if HTTPS), otherwise cube page
              - secondary embed: cube mini-app URL
          */}
          <ShareToFarcaster
            text={cubeShareText}
            url={nftImageUrl || cubeUrl}
            secondaryUrl={cubeUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold
              bg-gradient-to-r from-violet-500/25 via-fuchsia-500/25 to-sky-500/25
              border border-violet-300/70
              text-violet-50
              shadow-[0_0_18px_rgba(167,139,250,0.45)]
              hover:shadow-[0_0_26px_rgba(129,140,248,0.65)]
              hover:translate-y-[1px]
              transition"
          >
            <span className="text-sm">✦</span>
            <span>Share cube on Farcaster</span>
          </ShareToFarcaster>

          {/* X / Twitter share for cube (one URL only) */}
          <button
            type="button"
            onClick={() => openTwitterShare(cubeShareText, cubeUrl)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold
              bg-gradient-to-r from-sky-500/20 via-sky-400/25 to-indigo-500/25
              border border-sky-300/70
              text-sky-50
              shadow-[0_0_18px_rgba(56,189,248,0.35)]
              hover:shadow-[0_0_26px_rgba(59,130,246,0.6)]
              hover:translate-y-[1px]
              transition"
          >
            <span className="text-sm">𝕏</span>
            <span>Share cube on X</span>
          </button>
        </div>
      </div>

      {/* Share the BaseBlox app itself */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 px-4 py-4 space-y-3 shadow-inner shadow-slate-900/70">
        <div className="flex flex-col items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
            <span className="text-xs">📣</span>
            Share BaseBlox
          </span>
          <p className="text-xs text-slate-300/90 max-w-xs">
            Invite others to mint their own identity cube and start aging on
            Base.
          </p>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:justify-center gap-2.5">
          {/* Farcaster share for app */}
          <ShareToFarcaster
            text={appShareText}
            url={appShareUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold
              bg-gradient-to-r from-violet-500/25 via-indigo-500/25 to-sky-500/25
              border border-violet-300/70
              text-violet-50
              shadow-[0_0_18px_rgba(167,139,250,0.45)]
              hover:shadow-[0_0_26px_rgba(129,140,248,0.65)]
              hover:translate-y-[1px]
              transition"
          >
            <span className="text-sm">✦</span>
            <span>Share app on Farcaster</span>
          </ShareToFarcaster>

          {/* X / Twitter share for app */}
          <button
            type="button"
            onClick={() => openTwitterShare(appShareText, appShareUrl)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold
              bg-gradient-to-r from-sky-500/20 via-sky-400/25 to-indigo-500/25
              border border-sky-300/70
              text-sky-50
              shadow-[0_0_18px_rgba(56,189,248,0.35)]
              hover:shadow-[0_0_26px_rgba(59,130,246,0.6)]
              hover:translate-y-[1px]
              transition"
          >
            <span className="text-sm">𝕏</span>
            <span>Share app on X</span>
          </button>
        </div>
      </div>
    </div>
  );
}

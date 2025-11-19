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

function getCubeUrl(cubeId: number): string {
  const origin = getSiteOrigin();
  // later you can swap this to /cube/[id]
  return `${origin}/?cubeId=${cubeId}`;
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
  const origin = getSiteOrigin();
  const cubeUrl = hasCube ? getCubeUrl(cubeId) : origin;
  const nftImageUrl = cubeImageUrl; // may be undefined

  const cubeShareText = hasCube
    ? `My BaseBlox identity cube #${cubeId} on Base – ${ageDays} days old, ${prestigeLabelText}${
        primarySymbol ? `, primary token ${primarySymbol}` : ""
      }.`
    : "Mint your BaseBlox identity cube on Base.";

  const appShareText =
    "BaseBlox – evolving onchain identity cubes on Base. One cube per wallet, tracking age, prestige, and your primary token.";

  return (
    <div className="glass-card px-4 py-4 sm:px-5 sm:py-5 space-y-4">
      <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
        Share
      </p>

      {/* Share your cube */}
      <div className="rounded-2xl bg-slate-900/85 px-3 py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-50">
              Share your cube
            </p>
            <p className="text-[11px] text-slate-400">
              Post your current cube stats and let people see your onchain
              identity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {/* Farcaster share for cube:
              - primary embed: NFT image (if present), otherwise cube page
              - secondary embed: cube page / app URL
          */}
          <ShareToFarcaster
            text={cubeShareText}
            url={nftImageUrl || cubeUrl}
            secondaryUrl={cubeUrl}
            className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium bg-violet-500/20 border border-violet-400/70 text-violet-50 hover:bg-violet-500/30 transition"
          />

          {/* X / Twitter share for cube (can only take one URL) */}
          <button
            type="button"
            onClick={() => openTwitterShare(cubeShareText, cubeUrl)}
            className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium bg-sky-500/20 border border-sky-400/70 text-sky-50 hover:bg-sky-500/30 transition"
          >
            Share cube on X
          </button>
        </div>
      </div>

      {/* Share the BaseBlox app itself */}
      <div className="rounded-2xl bg-slate-900/85 px-3 py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-50">
              Share BaseBlox
            </p>
            <p className="text-[11px] text-slate-400">
              Invite others to mint their own identity cube on Base.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {/* Farcaster share for app */}
          <ShareToFarcaster
            text={appShareText}
            url={origin}
            className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium bg-violet-500/20 border border-violet-400/70 text-violet-50 hover:bg-violet-500/30 transition"
          />

          {/* X / Twitter share for app */}
          <button
            type="button"
            onClick={() => openTwitterShare(appShareText, origin)}
            className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium bg-sky-500/20 border border-sky-400/70 text-sky-50 hover:bg-sky-500/30 transition"
          >
            Share app on X
          </button>
        </div>
      </div>
    </div>
  );
}

// components/ShareSection.tsx
"use client";

import ShareToFarcaster from "@/components/ShareToFarcaster";
import { buildTweetUrl } from "@/lib/share";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
  primarySymbol?: string;
  cubeImageUrl?: string;           // 👈 NEW
};

function resolveOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_URL ||
    "https://baseblox.vercel.app";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

const MINI_APP_LINK =
  process.env.NEXT_PUBLIC_FC_MINIAPP_LINK ||
  process.env.NEXT_PUBLIC_FC_MINIAPP_URL ||
  "";

function copyToClipboard(text: string) {
  if (!text) return;
  navigator?.clipboard?.writeText(text).catch(() => {});
}

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
  primarySymbol,
  cubeImageUrl,
}: ShareSectionProps) {
  const origin = resolveOrigin();

  // ✅ NFT image: should be a direct https image URL (like your BaseBots robot art)
  const nftImageUrl =
    hasCube && cubeImageUrl && cubeImageUrl.startsWith("http")
      ? cubeImageUrl
      : undefined;

  // ✅ Mini-app URL
  const appShareUrl = MINI_APP_LINK || origin;

  // ✅ Static share card for the app (like your BaseBots “MINT YOUR COURIER” image)
  const appShareImageUrl = `${origin}/share.PNG`;

  // --------- Text ----------
  const cubeBaseText = hasCube
    ? `My BaseBlox cube #${cubeId} on Base – ${ageDays} days old, ${prestigeLabelText}.`
    : "Mint a BaseBlox cube and let your age, prestige, and token define your onchain identity.";

  const cubeFcText = `${cubeBaseText} #BaseBlox #Onchain`;
  const cubeTweetText = `${cubeBaseText} #BaseBlox #Base`;

  const cubeTweetUrl = buildTweetUrl({
    text: cubeTweetText,
    url: nftImageUrl || appShareUrl,
  });

  const appFcText =
    "Mint a BaseBlox on Base and let your cube track age, prestige & your primary token. #BaseBlox #Onchain";

  const appTweetText =
    "Mint a BaseBlox identity cube on Base — your evolving digital identity. #BaseBlox #Base";

  const appTweetUrl = buildTweetUrl({
    text: appTweetText,
    url: appShareUrl,
  });

  const disabledCubeShare = !hasCube || !nftImageUrl;

  return (
    <div className="glass-card px-4 py-4 sm:px-5 sm:py-5 space-y-4">
      {/* Share Your Cube */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
          Share your cube
        </p>
        <p className="text-[11px] text-slate-200/85 mb-2">
          One cast with your cube image + your mini-app link.
        </p>

        <div className="flex flex-wrap gap-2">
          {disabledCubeShare ? (
            <button
              type="button"
              disabled
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold
                bg-slate-900/60 border border-slate-700 text-slate-500 cursor-not-allowed"
            >
              Share cube on Farcaster
            </button>
          ) : (
            <ShareToFarcaster
              text={cubeFcText}
              url={nftImageUrl}     // 🟩 IMAGE-ONLY CARD (like BaseBots art)
              secondaryUrl={appShareUrl} // 🟦 MINI-APP CARD
            />
          )}

          <a
            href={disabledCubeShare ? "#" : cubeTweetUrl}
            target="_blank"
            rel="noreferrer"
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition
              ${
                disabledCubeShare
                  ? "bg-slate-900/60 border border-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-slate-900/80 border border-white/20 text-slate-50 hover:bg-slate-800/90 shadow-[0_10px_24px_rgba(0,0,0,.35)]"
              }`}
          >
            Share cube on X
          </a>
        </div>

        {hasCube && nftImageUrl && (
          <button
            type="button"
            onClick={() => copyToClipboard(nftImageUrl)}
            className="mt-2 inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-medium
              bg-slate-900/70 border border-slate-600 text-slate-200
              hover:bg-slate-800/90 transition"
          >
            Copy cube image URL
          </button>
        )}

        {!hasCube && (
          <p className="mt-2 text-[11px] text-slate-500">
            Mint a cube to unlock personal share links.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      {/* Share the App */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
          Share BaseBlox app
        </p>
        <p className="text-[11px] text-slate-200/85 mb-2">
          One share image that opens your mini-app.
        </p>

        <div className="flex flex-wrap gap-2">
          <ShareToFarcaster
            text={appFcText}
            url={appShareImageUrl} // image card
            secondaryUrl={appShareUrl} // opens mini-app
          />

          <a
            href={appTweetUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold
              bg-slate-900/80 border border-white/20 text-slate-50
              hover:bg-slate-800/90 transition shadow-[0_10px_24px_rgba(0,0,0,.35)]"
          >
            Share app on X
          </a>
        </div>

        <button
          type="button"
          onClick={() => copyToClipboard(appShareUrl)}
          className="mt-2 inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-medium
            bg-slate-900/70 border border-slate-600 text-slate-200
            hover:bg-slate-800/90 transition"
        >
          Copy mini-app link
        </button>
      </div>
    </div>
  );
}

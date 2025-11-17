// components/ShareSection.tsx
"use client";

import Image from "next/image";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
};

const SITE_URL = "https://baseblox.vercel.app" as const;

// ✅ Farcaster mini app URL (env can override if needed)
const FARCASTER_MINIAPP_URL =
  process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL ??
  "https://farcaster.xyz/miniapps/N_U7EfeREI4I/baseblox";

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
}: ShareSectionProps) {
  // ---------- Share helpers (cube-specific) ----------

  function handleShareX() {
    if (!hasCube) return;

    const text = `My BaseBlox cube #${cubeId} on Base — ${ageDays} days old, ${prestigeLabelText}.`;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(SITE_URL)}`;

    if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank");
    }
  }

  function handleShareFarcaster() {
    if (!hasCube) return;

    const textLines = [
      `Checking in with my BaseBlox cube #${cubeId} — ${ageDays} days old, ${prestigeLabelText}.`,
      "",
      `Mini app: ${FARCASTER_MINIAPP_URL}`,
    ];

    const text = textLines.join("\n");

    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      text,
    )}&embeds[]=${encodeURIComponent(SITE_URL)}`;

    if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank");
    }
  }

  // ---------- Share helpers (project-level CTA using share.PNG OG) ----------

  function handleShareProjectX() {
    const text =
      "Mint your BaseBlox identity cube on Base and let your onchain age & prestige show.";

    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(SITE_URL)}`;

    if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank");
    }
  }

  function handleShareProjectFarcaster() {
    const textLines = [
      "Mint your BaseBlox identity cube on Base — one evolving cube per wallet.",
      "",
      `Mini app: ${FARCASTER_MINIAPP_URL}`,
    ];

    const text = textLines.join("\n");

    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      text,
    )}&embeds[]=${encodeURIComponent(SITE_URL)}`;

    if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank");
    }
  }

  return (
    <>
      {/* Share your cube */}
      <div className="glass-card px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
              Share your cube
            </p>
            <p className="text-xs text-slate-200/85">
              Cast or tweet your BaseBlox stats as a flex.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!hasCube}
            onClick={handleShareFarcaster}
            className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
              hasCube
                ? "bg-violet-500/20 border-violet-400/60 text-violet-50 hover:bg-violet-500/30"
                : "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <span>Share on Farcaster</span>
          </button>

          <button
            type="button"
            disabled={!hasCube}
            onClick={handleShareX}
            className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
              hasCube
                ? "bg-slate-900 border-slate-500 text-slate-100 hover:bg-black"
                : "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <span>Share on X</span>
          </button>
        </div>

        {!hasCube && (
          <p className="text-[10px] text-slate-400 mt-2">
            Mint a cube first to unlock sharing.
          </p>
        )}
      </div>

      {/* Project-wide share CTA using share.PNG embed */}
      <div className="glass-card px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
              Share BaseBlox
            </p>
            <p className="text-xs text-slate-200/85 mb-3">
              Boost the project itself. This uses{" "}
              <span className="font-semibold">share.PNG</span> as the embed
              image so the card looks like the BaseBlox hero.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleShareProjectFarcaster}
                className="text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 bg-violet-500/15 border-violet-400/60 text-violet-50 hover:bg-violet-500/25"
              >
                <span>Cast about BaseBlox</span>
              </button>
              <button
                type="button"
                onClick={handleShareProjectX}
                className="text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 bg-slate-900 border-slate-500 text-slate-100 hover:bg-black"
              >
                <span>Tweet about BaseBlox</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center mt-3 md:mt-0">
            <Image
              src="/share.PNG"
              alt="BaseBlox share preview"
              width={260}
              height={140}
              className="rounded-xl shadow-lg shadow-sky-900/50 motion-safe:animate-pulse hover:-translate-y-1 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </>
  );
}

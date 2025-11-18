// components/ShareSection.tsx
"use client";

import Image from "next/image";
import ShareToFarcaster from "@/components/ShareToFarcaster";
import { buildTweetUrl, getRandomShareText, toAbs } from "@/lib/share";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
  /** Optional path like "/cube/123" for cube-specific shares */
  cubePath?: string;
};

// Prefer explicit env miniapp link if set, else fall back to site
const MINIAPP_URL: string =
  process.env.NEXT_PUBLIC_FC_MINIAPP_LINK ??
  process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "https://farcaster.xyz/miniapps/N_U7EfeREI4I/baseblox";

const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "https://baseblox.vercel.app";

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
  cubePath,
}: ShareSectionProps) {
  // Cube-specific page (relative) -> absolute for embeds
  const cubeUrl = cubePath ? toAbs(cubePath) : toAbs("/");

  // Project-level embed image: share.PNG OG hero
  const projectEmbedUrl = toAbs("/share.PNG");

  // ---------- Helpers ----------

  function handleShareXCube() {
    if (!hasCube) return;

    const text =
      getRandomShareText("twitter") +
      `\n\nCube #${cubeId} — ${ageDays} days old, ${prestigeLabelText}.`;

    const tweetUrl = buildTweetUrl({
      text,
      url: cubeUrl,
    });

    if (typeof window !== "undefined") {
      window.open(tweetUrl, "_blank", "noopener,noreferrer");
    }
  }

  function handleShareProjectX() {
    const text =
      getRandomShareText("twitter") +
      "\n\nMint your BaseBlox identity cube on Base — one cube per wallet.";

    const tweetUrl = buildTweetUrl({
      text,
      url: SITE_URL,
    });

    if (typeof window !== "undefined") {
      window.open(tweetUrl, "_blank", "noopener,noreferrer");
    }
  }

  // ---------- Render ----------

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
          <ShareToFarcaster
            className={hasCube ? "" : "opacity-50 cursor-not-allowed"}
            text={
              hasCube
                ? [
                    `Checking in with my BaseBlox cube #${cubeId} — ${ageDays} days old, ${prestigeLabelText}.`,
                    "",
                    `Mini app: ${MINIAPP_URL}`,
                  ].join("\n")
                : ""
            }
            url={hasCube ? cubeUrl : SITE_URL}
          />

          <button
            type="button"
            disabled={!hasCube}
            onClick={handleShareXCube}
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
              <ShareToFarcaster
                className="text-xs px-3 py-1.5 rounded-full"
                text={[
                  "Mint your BaseBlox identity cube on Base — one evolving cube per wallet.",
                  "",
                  `Mini app: ${MINIAPP_URL}`,
                ].join("\n")}
                // Here we explicitly embed the share image so Warpcast gets a nice card
                url={projectEmbedUrl}
              />

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

"use client";

import Image from "next/image";
import ShareToFarcaster from "@/components/ShareToFarcaster";
import { BASEBLOCKS_ADDRESS } from "@/lib/baseblocksAbi";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
};

/** Resolve site origin on client + server */
function getSiteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (env) {
    return `https://${env.replace(/\/$/, "")}`;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://baseblox.vercel.app";
}

const SITE_ORIGIN = getSiteOrigin();

/** Mini app URL (if you set one), else fall back to site */
const FARCASTER_MINIAPP_URL =
  process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL ??
  process.env.NEXT_PUBLIC_FC_MINIAPP_LINK ??
  SITE_ORIGIN;

function openTweetIntent(text: string, url?: string) {
  if (typeof window === "undefined") return;
  const u = new URL("https://x.com/intent/tweet");
  if (text) u.searchParams.set("text", text);
  if (url) u.searchParams.set("url", url);
  window.open(u.toString(), "_blank", "noopener,noreferrer");
}

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
}: ShareSectionProps) {
  // ---- URLs we care about ----
  const cubeBaseScanUrl = hasCube
    ? `https://basescan.org/token/${BASEBLOCKS_ADDRESS}?a=${cubeId}`
    : "";
  // This is the OG page we just created; it always uses share.PNG as the card image
  const cubeOgUrl = hasCube ? `/og/cube/${cubeId}` : "/";

  const projectUrl = SITE_ORIGIN;

  // ---- Farcaster / X text ----

  const cubeFcText = hasCube
    ? [
        `Checking in with my BaseBlox cube #${cubeId} — ${ageDays} days old, ${prestigeLabelText}.`,
        "",
        cubeBaseScanUrl ? `Cube on BaseScan: ${cubeBaseScanUrl}` : "",
        `Mini app: ${FARCASTER_MINIAPP_URL}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "Mint your BaseBlox identity cube on Base.";

  const cubeTweetText = hasCube
    ? `My BaseBlox cube #${cubeId} on Base — ${ageDays} days old, ${prestigeLabelText}.`
    : "Mint your BaseBlox identity cube on Base.";

  const projectFcText = [
    "Mint your BaseBlox identity cube on Base — one cube per wallet that tracks your age, prestige, and primary token.",
    "",
    `Mini app: ${FARCASTER_MINIAPP_URL}`,
  ].join("\n");

  const projectTweetText =
    "Mint your BaseBlox identity cube on Base and let your onchain age & prestige show.";

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
          {/* Farcaster: uses working ShareToFarcaster helper */}
          <ShareToFarcaster
            text={cubeFcText}
            url={cubeOgUrl}
            className={
              hasCube
                ? "text-xs px-3 py-1.5"
                : "text-xs px-3 py-1.5 opacity-50 cursor-not-allowed pointer-events-none"
            }
          />

          {/* X / Twitter */}
          <button
            type="button"
            disabled={!hasCube}
            onClick={() =>
              openTweetIntent(
                cubeTweetText,
                cubeBaseScanUrl || projectUrl,
              )
            }
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
              Boost the project itself. These links use{" "}
              <span className="font-semibold">share.PNG</span> as the embed
              image so the card looks like the BaseBlox hero.
            </p>

            <div className="flex flex-wrap gap-2">
              {/* Farcaster: project-level share, embeds your root URL which already has share.PNG OG metadata */}
              <ShareToFarcaster
                text={projectFcText}
                url="/"
                className="text-xs px-3 py-1.5"
              />

              {/* X / Twitter: project-level */}
              <button
                type="button"
                onClick={() => openTweetIntent(projectTweetText, projectUrl)}
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

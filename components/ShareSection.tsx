// components/ShareSection.tsx
"use client";

import ShareToFarcaster from "@/components/ShareToFarcaster";
import { buildTweetUrl } from "@/lib/share";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
};

function resolveOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
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

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
}: ShareSectionProps) {
  const origin = resolveOrigin();

  // ---------- Share YOUR cube (per-cube OG page) ----------
  const cubeOgPath = hasCube ? `/og/cube/${cubeId}` : "/";
  const cubeOgUrl = `${origin}${cubeOgPath}`;

  const cubeBaseText = hasCube
    ? `My BaseBlox cube #${cubeId} on Base – ${ageDays} days old, ${prestigeLabelText}.`
    : "Mint a BaseBlox cube on Base and let your age, prestige, and primary token tell your story.";

  const cubeFcText = cubeBaseText + " #BaseBlox #Onchain";
  const cubeTweetText = cubeBaseText + " #BaseBlox #Base";
  const cubeTweetUrl = buildTweetUrl({ text: cubeTweetText, url: cubeOgUrl });

  // ---------- Share the APP (mini-app / homepage) ----------
  const appShareUrl = MINI_APP_LINK || origin;

  const appFcText =
    "Mint a BaseBlox on Base and let your cube track age, prestige, and your primary token.";
  const appTweetText =
    "Mint a BaseBlox identity cube on Base and let your onchain age + prestige show. #BaseBlox #Base";
  const appTweetUrl = buildTweetUrl({ text: appTweetText, url: appShareUrl });

  const disabledCubeShare = !hasCube;

  return (
    <div className="glass-card px-4 py-4 sm:px-5 sm:py-5 space-y-4">
      {/* Share your cube */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
          Share your cube
        </p>
        <p className="text-[11px] text-slate-200/85 mb-2">
          Post a card that uses your cube&apos;s onchain art as the preview on
          Farcaster and X.
        </p>

        <div className="flex flex-wrap gap-2">
          <ShareToFarcaster
            text={cubeFcText}
            url={cubeOgUrl}
            disabled={disabledCubeShare}
          />
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

        {hasCube && (
          <p className="mt-2 text-[11px] text-slate-400">
            Link shared:&nbsp;
            <code className="break-all text-slate-300">{cubeOgUrl}</code>
          </p>
        )}
        {!hasCube && (
          <p className="mt-2 text-[11px] text-slate-500">
            Mint a cube first to unlock personal share links.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      {/* Share the app */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
          Share BaseBlox app
        </p>
        <p className="text-[11px] text-slate-200/85 mb-2">
          Invite friends to forge their own cubes. Uses the main BaseBlox card
          image.
        </p>

        <div className="flex flex-wrap gap-2">
          <ShareToFarcaster text={appFcText} url={appShareUrl} />
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

        <p className="mt-2 text-[11px] text-slate-400">
          App link:&nbsp;
          <code className="break-all text-slate-300">{appShareUrl}</code>
        </p>
      </div>
    </div>
  );
}

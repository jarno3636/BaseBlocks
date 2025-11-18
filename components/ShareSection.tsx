// components/ShareSection.tsx
"use client";

import ShareToFarcaster from "@/components/ShareToFarcaster";
import { buildTweetUrl } from "@/lib/share";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
  primarySymbol?: string; // 👈 NEW
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

// 🔹 small helper for copy buttons
function copyToClipboard(text: string) {
  if (!text) return;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      console.error("Failed to copy to clipboard");
    });
  } else if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      console.error("Fallback copy failed", e);
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
  primarySymbol, // 👈 NEW
}: ShareSectionProps) {
  const origin = resolveOrigin();

  // ---------- Share YOUR cube (per-cube OG page) ----------
  const cubeOgPath = hasCube
    ? `/og/cube/${cubeId}?age=${ageDays}&prestige=${encodeURIComponent(
        prestigeLabelText,
      )}&ticker=${encodeURIComponent(primarySymbol ?? "")}`
    : "/";
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
          {hasCube ? (
            <ShareToFarcaster text={cubeFcText} url={cubeOgUrl} />
          ) : (
            <button
              type="button"
              disabled
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold
                         bg-slate-900/60 border border-slate-700 text-slate-500 cursor-not-allowed"
            >
              Share cube on Farcaster
            </button>
          )}

          <a
            href={disabledCubeShare ? "#" : cubeTweetUrl}
            target={disabledCubeShare ? undefined : "_blank"}
            rel={disabledCubeShare ? undefined : "noreferrer"}
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
          <button
            type="button"
            onClick={() => copyToClipboard(cubeOgUrl)}
            className="mt-2 inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-medium
                       bg-slate-900/70 border border-slate-600 text-slate-200
                       hover:bg-slate-800/90 transition"
          >
            Copy cube link
          </button>
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

        <button
          type="button"
          onClick={() => copyToClipboard(appShareUrl)}
          className="mt-2 inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-medium
                     bg-slate-900/70 border border-slate-600 text-slate-200
                     hover:bg-slate-800/90 transition"
        >
          Copy app link
        </button>
      </div>
    </div>
  );
}

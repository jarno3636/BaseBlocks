// components/ShareSection.tsx
"use client";

import ShareToFarcaster from "./ShareToFarcaster";

type ShareSectionProps = {
  hasCube: boolean;
  cubeId: number;
  ageDays: number;
  prestigeLabelText: string;
  /** Optional path to the cube page, e.g. `/cube/1` */
  cubePath?: string;
};

function getOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  const env =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "";
  if (env) {
    const withProto = /^https?:\/\//i.test(env)
      ? env
      : `https://${env}`;
    return withProto.replace(/\/$/, "");
  }

  return "https://baseblox.vercel.app";
}

function buildTwitterUrl(text: string, url: string) {
  const u = new URL("https://x.com/intent/post");
  if (text) u.searchParams.set("text", text);
  if (url) u.searchParams.set("url", url);
  return u.toString();
}

export default function ShareSection({
  hasCube,
  cubeId,
  ageDays,
  prestigeLabelText,
  cubePath,
}: ShareSectionProps) {
  const origin = getOrigin();

  // Page URL we want people to land on (home or cube-specific page)
  const pageUrl = cubePath ? `${origin}${cubePath}` : origin;

  // Image we want Farcaster to embed (your share.PNG)
  const embedImageUrl = `${origin}/share.PNG`;

  const farcasterText = hasCube
    ? `BaseBlox cube #${cubeId} – ${prestigeLabelText} (${ageDays} days old) on Base.`
    : "Mint your BaseBlox identity cube on Base and let your age, prestige, and primary token tell your onchain story.";

  const twitterText = hasCube
    ? `Just minted my BaseBlox identity cube #${cubeId} on Base – ${prestigeLabelText} (${ageDays} days old).`
    : "Mint your BaseBlox identity cube on Base and start leveling up your onchain identity.";

  const twitterHref = buildTwitterUrl(twitterText, pageUrl);

  return (
    <div className="glass-card px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
            Share your cube
          </p>
          <p className="text-xs text-slate-200/85 mt-1">
            Post your BaseBlox cube to Farcaster or X. Embeds should pull in
            your <code>share.PNG</code> artwork.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ShareToFarcaster
            text={farcasterText}
            url={embedImageUrl}
          />

          <a
            href={twitterHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-black/60 hover:bg-black/80 border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,.45)] transition-colors"
          >
            Share on X
          </a>
        </div>
      </div>
    </div>
  );
}

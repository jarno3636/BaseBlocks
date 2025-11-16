// lib/share.ts
function absBase(): string {
  const env = (process.env.NEXT_PUBLIC_FC_MINIAPP_LINK || process.env.NEXT_PUBLIC_URL || "").replace(/\/$/, "");
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://basebots.vercel.app";
}

export function toAbs(url: string): string {
  try {
    if (/^https?:\/\//i.test(url)) return url;
    return new URL(url, absBase()).toString();
  } catch {
    return url;
  }
}

export function buildTweetUrl({ text = "", url = "" }: { text?: string; url?: string }) {
  const u = new URL("https://x.com/intent/post"); // (tweet is fine too)
  if (text) u.searchParams.set("text", text);
  if (url) u.searchParams.set("url", toAbs(url));
  return u.toString();
}

const FARCASTER_LINES = [
  "Summoned a Basebot ⚙️✨",
  "My courier from the Blue Tomorrow just arrived",
  "On-chain robot vibes on Base",
  "Minting robots like it’s 2099",
];

const TWITTER_LINES = [
  "Meet my on-chain Basebot 🤖✨",
  "Summoned a courier from the Blue Tomorrow",
  "Fully on-chain SVG robot on Base",
  "My robot just touched down on Base",
];

export function getRandomShareText(kind: "farcaster" | "twitter" = "twitter") {
  const src = kind === "farcaster" ? FARCASTER_LINES : TWITTER_LINES;
  return src[Math.floor(Math.random() * src.length)];
}

export function buildWarpcastCompose({ text = "", embed = "" }: { text?: string; embed?: string }) {
  const u = new URL("https://warpcast.com/~/compose");
  if (text) u.searchParams.set("text", text);
  if (embed) u.searchParams.append("embeds[]", toAbs(embed));
  return u.toString();
}

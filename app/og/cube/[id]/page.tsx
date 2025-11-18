// app/og/cube/[id]/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Params = { id: string };

export const revalidate = 0; // more aggressive, helps "refresh" cards faster

function baseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_URL;

  if (!raw) return "https://baseblox.vercel.app";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

const MINI_APP_LINK =
  process.env.NEXT_PUBLIC_FC_MINIAPP_LINK ||
  process.env.NEXT_PUBLIC_FC_MINIAPP_URL ||
  ""; // e.g. https://farcaster.xyz/miniapps/xxxx/your-mini-app

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { id } = await params;
  const clean = String(id ?? "").replace(/[^\d]/g, "");
  const base = baseUrl();

  const title = clean
    ? `BaseBlox cube #${clean}`
    : "BaseBlox cube";
  const desc = clean
    ? `BaseBlox identity cube #${clean} on Base. Age, prestige, and primary token onchain.`
    : "BaseBlox identity cube on Base.";

  // Our dynamic OG image – pulls real stats + art from the API route
  const imgCard = clean
    ? `${base}/api/baseblox/card/${clean}`
    : `${base}/share.PNG`;

  // Cache-buster to encourage Twitter / Warpcast to re-fetch
  const cacheBuster = Date.now().toString(36);
  const cardWithBuster = `${imgCard}?v=${cacheBuster}`;

  const url = clean ? `${base}/og/cube/${clean}` : `${base}/og/cube`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      images: [{ url: cardWithBuster, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [cardWithBuster],
    },
  };
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const clean = String(id ?? "").replace(/[^\d]/g, "");

  const baseMini =
    MINI_APP_LINK || "https://farcaster.xyz/miniapps/your-mini-app-slug";

  const target = clean ? `${baseMini}?cube=${clean}` : baseMini;

  // Clicking the card takes the user into the mini-app
  redirect(target);
}

// app/og/cube/[id]/page.tsx
import type { Metadata } from "next";

type Params = { id: string };

export const dynamic = "force-static";
export const revalidate = 300;

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

  // Per-cube card for X / Warpcast, fallback to share.PNG if no id
  const imgCard = clean
    ? `${base}/api/baseblox/card/${clean}`
    : `${base}/share.PNG`;

  // Tiny cache-buster to help X refresh
  const cardWithBuster = `${imgCard}?v=${Date.now().toString().slice(-6)}`;

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

  return (
    <main
      style={{
        padding: 24,
        color: "white",
        background: "#020617",
        minHeight: "60vh",
      }}
    >
      <h1>BaseBlox cube #{clean || "—"}</h1>
      <p>This page exists to provide rich previews on Farcaster/X.</p>
      <p>
        Preview image:{" "}
        <code>
          {clean
            ? `/api/baseblox/card/${clean}`
            : "/share.PNG"}
        </code>
      </p>
    </main>
  );
}

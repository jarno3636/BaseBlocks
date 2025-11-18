// app/og/cube/[id]/page.tsx
import type { Metadata } from "next";

type Params = { id: string };

export const revalidate = 0; // encourage crawlers to re-fetch

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
  { params }: { params: Promise<Params> },
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

  // Dynamic OG image from the API route
  const imgCard = clean
    ? `${base}/api/baseblox/card/${clean}`
    : `${base}/share.PNG`;

  // Tiny cache-buster to nudge X/Warpcast to refresh
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
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const clean = String(id ?? "").replace(/[^\d]/g, "");
  const base = baseUrl();

  const miniApp = MINI_APP_LINK || "https://farcaster.xyz/miniapps/your-mini-app-slug";

  const imgCard = clean
    ? `${base}/api/baseblox/card/${clean}`
    : `${base}/share.PNG`;

  return (
    <main
      style={{
        padding: 24,
        color: "white",
        background: "#020617",
        minHeight: "60vh",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        BaseBlox cube {clean ? `#${clean}` : ""}
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 8 }}>
        This page exists primarily to provide rich previews on Farcaster and X.
      </p>
      <p style={{ opacity: 0.8, marginBottom: 8 }}>
        Card image URL:{" "}
        <code style={{ fontSize: 14, background: "#020617", padding: 4 }}>
          {imgCard}
        </code>
      </p>
      <p style={{ opacity: 0.8, marginTop: 16 }}>
        Mini-app:{" "}
        <a
          href={miniApp}
          style={{ color: "#38bdf8", textDecoration: "underline" }}
        >
          Open BaseBlox mini-app
        </a>
      </p>
    </main>
  );
}

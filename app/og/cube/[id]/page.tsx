// app/og/cube/[id]/page.tsx
import type { Metadata } from "next";

type Params = { id: string };

export const revalidate = 0; // let OG image refresh more often

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

  const title = clean ? `BaseBlox cube #${clean}` : "BaseBlox cube";
  const desc = clean
    ? `BaseBlox identity cube #${clean} on Base. Age, prestige, and primary token onchain.`
    : "BaseBlox identity cube on Base.";

  // Dynamic OG image – this is the viem-powered card
  const imgCard = clean
    ? `${base}/api/baseblox/card/${clean}`
    : `${base}/share.PNG`;

  const url = clean ? `${base}/og/cube/${clean}` : `${base}/og/cube`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      images: [
        {
          url: imgCard,
          width: 1200,
          height: 630,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imgCard],
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

  // No server redirect – we show a tiny landing page with a button.
  return (
    <main
      style={{
        padding: 24,
        color: "#e5e7eb",
        background: "#020617",
        minHeight: "60vh",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        BaseBlox cube {clean ? `#${clean}` : ""}
      </h1>
      <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 480 }}>
        This URL powers rich link previews on Farcaster and X using your
        onchain cube art and stats.
      </p>
      <a
        href={target}
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 18px",
          borderRadius: 999,
          border: "1px solid rgba(56,189,248,0.7)",
          background:
            "radial-gradient(circle at 0 0, rgba(56,189,248,0.24), transparent 60%)",
          color: "#e0f2fe",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Open this cube in the BaseBlox mini app ↗
      </a>
    </main>
  );
}

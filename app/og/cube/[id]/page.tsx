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

  if (!raw) {
    return "https://baseblox.vercel.app";
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }

  return `https://${raw.replace(/\/$/, "")}`;
}

export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const { id } = params;
  const clean = String(id ?? "").replace(/[^\d]/g, "");
  const base = baseUrl();

  const title = clean
    ? `BaseBlox cube #${clean}`
    : "BaseBlox cube";
  const desc = clean
    ? `BaseBlox identity cube #${clean} on Base. Age, prestige, and primary token onchain.`
    : "BaseBlox identity cube on Base.";

  const image = `${base}/share.PNG`;
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
          url: image,
          width: 1200,
          height: 630,
          alt: "BaseBlox identity cube on Base",
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
    },
  };
}

export default function Page({ params }: { params: Params }) {
  const { id } = params;
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
      <p>Preview image: <code>/share.PNG</code></p>
    </main>
  );
}

// app/farcaster/miniapp/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Reuse the same origin logic as layout.tsx
function getOrigin() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;

  const origin = envUrl
    ? `https://${envUrl.replace(/\/$/, "")}`
    : "https://baseblox.vercel.app";

  return origin;
}

export const metadata: Metadata = (() => {
  const origin = getOrigin();
  const image = `${origin}/share.PNG`;

  const title = "BaseBlox: Identity Cubes";
  const description =
    "Mint your BaseBlox identity cube on Base and let your age, prestige, and primary token tell your onchain story.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "BaseBlox identity cube on Base",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
})();

type MiniAppPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function MiniAppPage({ searchParams }: MiniAppPageProps) {
  // Preserve all query params (fc_fid, fc_os, etc.) when redirecting to "/"
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      params.append(key, value);
    }
  }

  const query = params.toString();
  const target = query ? `/?${query}` : "/";

  redirect(target);
}

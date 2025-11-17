// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import type { Metadata, Viewport } from "next";
import AppReady from "@/components/AppReady";

/** ---- Dynamic metadata (absolute URLs + mini app / frame embed) ---- */
export async function generateMetadata(): Promise<Metadata> {
  // Prefer explicit site URL, then Vercel URL, then hard-coded fallback
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;

  const origin = envUrl
    ? `https://${envUrl.replace(/\/$/, "")}`
    : "https://baseblox.vercel.app";

  // This is the image used for X, Farcaster, etc.
  const image = `${origin}/share.PNG`;

  const title = "BaseBlox: Identity Cubes";
  const description =
    "Mint your BaseBlox identity cube on Base and let your age, prestige, and primary token tell your onchain story.";

  return {
    metadataBase: new URL(origin),
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
    other: {
      // Optional Farcaster frame-style metadata (when used as a simple link)
      // This still just opens your site; Base mini app behavior comes from farcaster.json.
      "fc:frame": "vNext",
      "fc:frame:image": image,
      "fc:frame:button:1": "Open BaseBlox",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": origin,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#020617] text-slate-50 antialiased">
        {/* Notify Farcaster as soon as the app is usable */}
        <AppReady />

        {/* wagmi / RainbowKit / etc */}
        <Providers>
          <main className="min-h-screen flex items-center justify-center px-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

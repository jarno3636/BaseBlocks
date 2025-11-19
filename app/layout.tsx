// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import type { Metadata, Viewport } from "next";
import AppReady from "@/components/AppReady";

/** ---- Dynamic metadata (absolute URLs + mini app / frame embed) ---- */
export async function generateMetadata(): Promise<Metadata> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;

  const origin = envUrl
    ? `https://${envUrl.replace(/\/$/, "")}`
    : "https://baseblox.vercel.app";

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
      {/* Let globals.css control the gradient background */}
      <body className="text-slate-50 antialiased">
        {/* Notify Farcaster / Base when the app is ready */}
        <AppReady />

        {/* wagmi / RainbowKit / mini-context / Neynar */}
        <Providers>
          {/* Center the app column inside Warpcast/Base */}
          <main className="min-h-screen flex justify-center">
            <div className="w-full max-w-lg sm:max-w-2xl lg:max-w-3xl px-3 sm:px-4 py-6 sm:py-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}

// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import type { Metadata, Viewport } from "next";
import MiniAppBoot from "@/components/MiniAppBoot";
import AppReady from "@/components/AppReady";

/** ---- Dynamic metadata (absolute URLs + mini app embed) ---- */
export async function generateMetadata(): Promise<Metadata> {
  const origin =
    (
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${(
            process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
          )!.replace(/\/$/, "")}`
        : "https://example.com"
    ).replace(/\/$/, "");

  const image = `${origin}/share.PNG`;

  return {
    title: "BaseBlocks – Onchain Identity Cubes",
    description:
      "BaseBlocks identity cubes: one evolving onchain cube per wallet that tracks your age, prestige, and primary token on Base.",
    openGraph: {
      title: "BaseBlocks – Onchain Identity Cubes",
      description:
        "Mint a BaseBlocks identity cube and watch it evolve with your time onchain.",
      type: "website",
      url: origin,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BaseBlocks – Onchain Identity Cubes",
      description:
        "Mint a BaseBlocks identity cube and watch it evolve with your time onchain.",
      images: [image],
    },
    other: {
      // Farcaster mini app embed (frame opens the same URL)
      "fc:frame": "vNext",
      "fc:frame:image": image,
      "fc:frame:button:1": "Open BaseBlocks",
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
        <MiniAppBoot>
          <Providers>
            <AppReady>
              {/* Clean mini-app shell – child page handles the card UI */}
              <main className="min-h-screen flex items-center justify-center px-4">
                {children}
              </main>
            </AppReady>
          </Providers>
        </MiniAppBoot>
      </body>
    </html>
  );
}

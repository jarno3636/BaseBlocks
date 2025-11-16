// app/layout.tsx
import "../styles/globals.css";
import Providers from "./providers";
import type { Metadata, Viewport } from "next";
import MiniAppBoot from "@/components/MiniAppBoot";
import AppReady from "@/components/AppReady";

/** ---- Dynamic metadata (absolute URLs + mini app embed) ---- */
export async function generateMetadata(): Promise<Metadata> {
  const origin =
    (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${(process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.VERCEL_URL)!.replace(/\/$/, "")}`
      : "https://example.com"
    ).replace(/\/$/, "");

  const image = `${origin}/share.PNG`;

  return {
    title: "Stats Peek | BaseBlocks",
    description: "Your Farcaster community snapshot, styled for BaseBlocks.",
    openGraph: {
      title: "Stats Peek | BaseBlocks",
      description: "Your Farcaster community snapshot, styled for BaseBlocks.",
      type: "website",
      url: origin,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Stats Peek | BaseBlocks",
      description: "Your Farcaster community snapshot, styled for BaseBlocks.",
      images: [image],
    },
    other: {
      // Farcaster mini app embed
      "fc:frame": "vNext",
      "fc:frame:image": image,
      "fc:frame:button:1": "Open Stats",
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
              {/* No Nav / BackgroundCubes – clean mini-app shell */}
              <main className="min-h-screen flex items-center justify-center">
                {children}
              </main>
            </AppReady>
          </Providers>
        </MiniAppBoot>
      </body>
    </html>
  );
}

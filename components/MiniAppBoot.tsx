// components/MiniAppBoot.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type MiniAppBootProps = {
  children: ReactNode;
};

/**
 * MiniAppBoot
 *
 * - In a regular browser: just renders children, no-op.
 * - Inside a Farcaster mini app: calls sdk.actions.ready() once so
 *   Warpcast / Neynar know the UI is loaded and can snap in cleanly.
 *
 * Safe to wrap your entire app with this in app/layout.tsx.
 */
export default function MiniAppBoot({ children }: MiniAppBootProps) {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Very light guard: only try ready() if we're in a mini app environment
    // (Warpcast / Neynar injects window.farcaster / mini app context)
    const isMiniAppEnv =
      typeof (window as any).farcaster !== "undefined" ||
      typeof (window as any).parent !== "undefined";

    if (!isMiniAppEnv) return;

    (async () => {
      try {
        await sdk.actions.ready();
      } catch {
        // swallow errors – we don't want this to break the app in normal browser usage
      }
    })();
  }, []);

  return <>{children}</>;
}

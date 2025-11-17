// app/providers.tsx
"use client";

import "@rainbow-me/rainbowkit/styles.css";
import "@coinbase/onchainkit/styles.css";

import React, { useMemo, type ReactNode, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { WagmiProvider, useReconnect } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { base } from "viem/chains";
import { wagmiConfig } from "@/lib/wallet";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { MiniContextProvider } from "@/lib/useMiniContext";

/* ---------------- BigInt JSON polyfill ---------------- */
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

if (typeof (BigInt.prototype as any).toJSON !== "function") {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

/* ---------------- React Query setup ------------------- */
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, refetchOnWindowFocus: false } },
});

function serializeData(data: unknown) {
  return typeof data === "bigint" ? data.toString() : data;
}

/* --------------- Auto-reconnect wallet ---------------- */
function AutoReconnect() {
  const { reconnect } = useReconnect();
  useEffect(() => {
    reconnect();
  }, [reconnect]);
  return null;
}

/* ---------- Neynar providers (lazy, safe load) ---------
   - MiniAppProvider gives you the Farcaster mini-app context (FID, etc.) when opened
     in Warpcast/Merkle.
   - NeynarProvider (optional) enables client SDK features if you provide
     NEXT_PUBLIC_NEYNAR_CLIENT_ID.
   Both are loaded via require() to avoid breaking builds if the package isn’t
   installed server-side.
-------------------------------------------------------- */
function NeynarProviders({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

  let MiniAppProvider: React.ComponentType<any> | null = null;
  let NeynarProvider: React.ComponentType<any> | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod: any = require("@neynar/react");
    MiniAppProvider = mod?.MiniAppProvider ?? null;
    NeynarProvider = mod?.NeynarProvider ?? mod?.default ?? null;
  } catch {
    // package not present at runtime — just render children
  }

  if (!MiniAppProvider && !NeynarProvider) return <>{children}</>;

  // Always wrap with MiniAppProvider if available (no props needed)
  if (MiniAppProvider) {
    return (
      <MiniAppProvider>
        {clientId && NeynarProvider ? (
          <NeynarProvider clientId={clientId}>{children}</NeynarProvider>
        ) : (
          children
        )}
      </MiniAppProvider>
    );
  }

  // If we only have NeynarProvider (rare), still wrap it when clientId exists
  if (clientId && NeynarProvider) {
    return <NeynarProvider clientId={clientId}>{children}</NeynarProvider>;
  }

  return <>{children}</>;
}

/* ------------------- Root Providers ------------------- */
export default function Providers({ children }: { children: React.ReactNode }) {
  const theme = useMemo(
    () =>
      darkTheme({
        accentColor: "#79ffe1",
        accentColorForeground: "#0a0b12",
        borderRadius: "large",
        overlayBlur: "small",
      }),
    []
  );

  const dehydratedState = dehydrate(queryClient, { serializeData });

  // CDP/OnchainKit API key (fallback keeps old var working)
  const onchainkitApiKey = (process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ||
    process.env.NEXT_PUBLIC_MINIKIT_PROJECT_ID ||
    "") as string;

  // Inner tree: everything *after* RainbowKit
  const innerTree = (
    <>
      <AutoReconnect />
      {onchainkitApiKey ? (
        // Full mini-app stack when OnchainKit is configured
        <OnchainKitProvider apiKey={onchainkitApiKey} chain={base}>
          <RainbowKitProvider
            theme={theme}
            initialChain={base}
            modalSize="compact"
            appInfo={{ appName: "BaseBlox" }}
          >
            {/* MiniKitProvider: mini-app notifications, etc. */}
            <MiniKitProvider chain={base} notificationProxyUrl="/api/notification">
              {/* Global Farcaster identity (fid/user) available everywhere */}
              <MiniContextProvider>
                {/* Neynar MiniAppProvider + (optional) NeynarProvider */}
                <NeynarProviders>{children}</NeynarProviders>
              </MiniContextProvider>
            </MiniKitProvider>
          </RainbowKitProvider>
        </OnchainKitProvider>
      ) : (
        // Safe fallback: still have wagmi + RainbowKit even if OnchainKit isn’t configured
        <RainbowKitProvider
          theme={theme}
          initialChain={base}
          modalSize="compact"
          appInfo={{ appName: "BaseBlox" }}
        >
          {children}
        </RainbowKitProvider>
      )}
    </>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <WagmiProvider config={wagmiConfig}>{innerTree}</WagmiProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

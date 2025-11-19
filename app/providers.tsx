// app/providers.tsx
"use client";

import "@rainbow-me/rainbowkit/styles.css";

import React, { useMemo, useEffect } from "react";
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

// ⭐ NEW: MiniKitProvider
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

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
    [],
  );

  const dehydratedState = dehydrate(queryClient, { serializeData });

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <WagmiProvider config={wagmiConfig}>
          <AutoReconnect />
          <RainbowKitProvider
            theme={theme}
            initialChain={base}
            modalSize="compact"
            appInfo={{ appName: "BaseBlox" }}
          >
            {/* ⭐ MiniKitProvider MUST WRAP your entire app */}
            <MiniKitProvider
              appId={process.env.NEXT_PUBLIC_MINIAPP_ID!}
            >
              {children}
            </MiniKitProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

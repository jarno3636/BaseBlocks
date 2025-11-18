// lib/wallet.ts
"use client";

import { http, cookieStorage, createStorage, createConfig } from "wagmi";
import { base } from "viem/chains";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  rainbowWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { injected } from "wagmi/connectors";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

// WalletConnect projectId (support both env names you used)
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WALLETCONNECT_ID ||
  "";

// RainbowKit wallet groups
const walletGroups = [
  {
    groupName: "Popular",
    wallets: [
      injectedWallet,
      metaMaskWallet,
      coinbaseWallet,
      rainbowWallet,
      rabbyWallet,
      walletConnectWallet,
    ],
  },
];

const rkConnectors = connectorsForWallets(walletGroups, {
  appName: "BaseBlox",
  projectId,
});

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || undefined),
  },
  connectors: [
    // Farcaster mini app connector (for Warpcast mini app context)
    miniAppConnector(),

    // 👇 Generic injected connector so ANY in-app dapp browser / wallet can connect
    injected({ shimDisconnect: true }),

    // RainbowKit connectors (MetaMask, Coinbase, Rainbow, Rabby, WalletConnect, etc.)
    ...rkConnectors,
  ],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});

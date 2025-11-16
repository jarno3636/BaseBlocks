// app/page.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BASEBLOCKS_ADDRESS, BASEBLOCKS_ABI } from "@/lib/baseblocksAbi";

function truncateAddress(addr?: string | null) {
  if (!addr) return "Not set";
  if (addr === "0x0000000000000000000000000000000000000000") return "Not set";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function decodeBytes8Symbol(sym?: string | null): string {
  if (!sym) return "";
  if (!sym.startsWith("0x")) return sym;
  const hex = sym.slice(2);
  let out = "";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (byte === 0) break;
    out += String.fromCharCode(byte);
  }
  return out;
}

function encodeBytes8Symbol(sym: string): `0x${string}` {
  const trimmed = sym.trim().slice(0, 8);
  const bytes: number[] = [];
  for (let i = 0; i < 8; i++) {
    if (i < trimmed.length) {
      bytes.push(trimmed.charCodeAt(i));
    } else {
      bytes.push(0);
    }
  }
  let hex = "0x";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex as `0x${string}`;
}

function seasonNameFromNow(): string {
  const now = Date.now();
  const seconds = Math.floor(now / 1000);
  const yearSeconds = 365 * 24 * 60 * 60;
  const t = seconds % yearSeconds;
  const winterCutoff = 90 * 24 * 60 * 60;
  const springCutoff = 180 * 24 * 60 * 60;
  const summerCutoff = 270 * 24 * 60 * 60;

  if (t < winterCutoff) return "Winter";
  if (t < springCutoff) return "Spring";
  if (t < summerCutoff) return "Summer";
  return "Autumn";
}

function ageTierLabel(ageDays: number): { label: string; subtitle: string } {
  if (ageDays < 7) return { label: "Fresh Mint", subtitle: "Newly forged cube" };
  if (ageDays < 30) return { label: "Settling In", subtitle: "Finding its place" };
  if (ageDays < 90) return { label: "Seasoned", subtitle: "Building history" };
  if (ageDays < 180) return { label: "Established", subtitle: "Recognized identity" };
  if (ageDays < 365) return { label: "Veteran", subtitle: "Deep onchain roots" };
  if (ageDays < 730) return { label: "Elder Cube", subtitle: "Years in the Base-verse" };
  return { label: "Ancient Block", subtitle: "A true onchain relic" };
}

function prestigeLabel(prestige: number): string {
  if (prestige === 0) return "Unprestiged";
  if (prestige === 1) return "Prestige I";
  if (prestige === 2) return "Prestige II";
  if (prestige === 3) return "Prestige III";
  return `Prestige ${prestige}`;
}

/**
 * Try to extract an image URL from a tokenURI.
 * - If it's data:application/json;base64, decode and pull `image`
 * - Otherwise, treat the URI itself as the image URL.
 */
function extractImageFromTokenUri(uri?: string | null): string | undefined {
  if (!uri) return undefined;

  if (uri.startsWith("data:application/json")) {
    try {
      const [, base64] = uri.split(",");
      if (!base64) return undefined;
      const jsonStr = typeof atob === "function" ? atob(base64) : "";
      if (!jsonStr) return undefined;
      const meta = JSON.parse(jsonStr);
      if (meta && typeof meta.image === "string") {
        return meta.image as string;
      }
    } catch {
      return undefined;
    }
  }

  // Fallback – assume it's already a usable URL (IPFS, HTTPS, etc.)
  return uri;
}

// Small circular avatar used in lists (recent / featured)
function BlueCubeAvatar({
  size = 40,
  imageSrc,
}: {
  size?: number;
  imageSrc?: string;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-slate-900/80 shadow-sm shadow-sky-900/40 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt="BaseBlox cube"
          width={size}
          height={size}
          className="object-cover"
        />
      ) : (
        <div
          className="rounded-[10px] bg-gradient-to-br from-sky-400 via-sky-500 to-blue-700 shadow-inner shadow-sky-900/60"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      )}
    </div>
  );
}

// Larger “NFT-style” cube render for the main cube / latest cube
function CubeVisual({
  tokenId,
  label = "Base cube",
  size = 120,
  imageSrc,
}: {
  tokenId?: number;
  label?: string;
  size?: number;
  imageSrc?: string;
}) {
  const cardWidth = size * 1.5;

  return (
    <div
      className="relative rounded-3xl border border-sky-400/50 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-slate-900/95 shadow-2xl shadow-sky-900/60 overflow-hidden"
      style={{ width: cardWidth }}
    >
      {/* glow */}
      <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.55),transparent_60%)] opacity-70" />
      <div className="relative flex flex-col items-center gap-3 px-4 pt-4 pb-4">
        <div
          className="relative flex items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-2xl shadow-sky-900/70 overflow-hidden"
          style={{ width: size, height: size }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={label}
              width={size}
              height={size}
              className="object-cover"
            />
          ) : (
            <div className="w-[70%] h-[70%] rounded-2xl border border-white/70 bg-sky-50/95 shadow-inner shadow-sky-900/40" />
          )}
        </div>
        <div className="w-full flex items-center justify-between text-[11px] text-slate-100/90">
          <span className="font-medium uppercase tracking-[0.16em]">
            {label}
          </span>
          {tokenId !== undefined && (
            <span className="rounded-full bg-slate-900/70 px-2 py-0.5 border border-sky-400/40 text-[10px]">
              #{tokenId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  // ---------- Onchain reads ----------

  const { data: cubeIdData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "cubeOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: Boolean(address) },
  });

  const hasCube = !!cubeIdData && cubeIdData > 0n;
  const cubeId = hasCube ? Number(cubeIdData) : 0;

  const { data: cubeData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "getCubeData",
    args: hasCube ? [cubeIdData!] : undefined,
    query: { enabled: hasCube },
  });

  const { data: ageSecondsData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "getAge",
    args: hasCube ? [cubeIdData!] : undefined,
    query: { enabled: hasCube },
  });

  const { data: maxSupplyData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "MAX_SUPPLY",
  });

  const { data: nextTokenIdData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "nextTokenId",
  });

  const { data: mintPriceData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "MINT_PRICE",
  });

  const { data: promoRemainingData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "promoMintsRemaining",
  });

  // Main cube tokenURI (for NFT art)
  const { data: mainTokenUriData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "tokenURI",
    args: hasCube ? [cubeIdData!] : undefined,
    query: { enabled: hasCube },
  });

  // ---------- Recent mints ----------

  const recentTokenIds = useMemo(() => {
    if (!nextTokenIdData || nextTokenIdData <= 1n) return [] as bigint[];
    const last = Number(nextTokenIdData) - 1;
    const first = Math.max(1, last - 4);
    const ids: bigint[] = [];
    for (let id = last; id >= first; id--) ids.push(BigInt(id));
    return ids;
  }, [nextTokenIdData]);

  const { data: recentResults } = useReadContracts({
    contracts: recentTokenIds.flatMap((id) => [
      {
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "ownerOf",
        args: [id],
      } as const,
      {
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "getCubeData",
        args: [id],
      } as const,
      {
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "tokenURI",
        args: [id],
      } as const,
    ]),
    query: { enabled: recentTokenIds.length > 0 },
  });

  const recentCubes = useMemo(() => {
    if (!recentResults || recentResults.length === 0) return [];
    const out: {
      tokenId: number;
      owner: string | undefined;
      mintedAtDate: string;
      imageUrl?: string;
    }[] = [];

    for (let i = 0; i < recentTokenIds.length; i++) {
      const tokenId = Number(recentTokenIds[i]);
      const ownerRes = recentResults[i * 3];
      const cubeRes = recentResults[i * 3 + 1];
      const tokenUriRes = recentResults[i * 3 + 2];

      const owner = ownerRes?.result as string | undefined;
      const cube = cubeRes?.result as any | undefined;
      const tokenUri = tokenUriRes?.result as string | undefined;
      const imageUrl = extractImageFromTokenUri(tokenUri);

      const mintedAtSeconds: number = cube ? Number(cube.mintedAt) : 0;
      const mintedAt =
        mintedAtSeconds > 0
          ? new Date(mintedAtSeconds * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—";

      out.push({ tokenId, owner, mintedAtDate: mintedAt, imageUrl });
    }

    return out;
  }, [recentResults, recentTokenIds]);

  // ---------- Derived for current cube ----------

  const {
    ageDays,
    ageTier,
    prestigeLevel,
    primaryToken,
    primarySymbol,
    mintedAtDate,
  } = useMemo(() => {
    const seconds = ageSecondsData ? Number(ageSecondsData) : 0;
    const days = Math.floor(seconds / 86400);

    const prestige = cubeData ? Number((cubeData as any).prestigeLevel) : 0;
    const primaryTokenAddr = cubeData ? (cubeData as any).primaryToken : undefined;
    const primarySymbolBytes = cubeData ? (cubeData as any).primarySymbol : undefined;

    const mintedAtSeconds = cubeData ? Number((cubeData as any).mintedAt) : 0;
    const mintedAt =
      mintedAtSeconds > 0
        ? new Date(mintedAtSeconds * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—";

    return {
      ageDays: days,
      ageTier: ageTierLabel(days),
      prestigeLevel: prestige,
      primaryToken: primaryTokenAddr as string | undefined,
      primarySymbol: decodeBytes8Symbol(primarySymbolBytes as string | undefined),
      mintedAtDate: mintedAt,
    };
  }, [ageSecondsData, cubeData]);

  const seasonName = seasonNameFromNow();
  const mintedCount = nextTokenIdData ? Number(nextTokenIdData) - 1 : 0;
  const maxSupply = maxSupplyData ? Number(maxSupplyData) : 0;
  const promoRemaining = promoRemainingData ? Number(promoRemainingData) : 0;
  const mintPriceEth = mintPriceData ? formatEther(mintPriceData) : "0";

  const notConnected = !isConnected;
  const noCubeYet = isConnected && !hasCube;

  const mainCubeImage = extractImageFromTokenUri(
    mainTokenUriData as string | undefined,
  );

  // ---------- Local state ----------

  const [primaryTokenInput, setPrimaryTokenInput] = useState("");
  const [primarySymbolInput, setPrimarySymbolInput] = useState("");
  const [manageError, setManageError] = useState<string | null>(null);
  const [manageSuccess, setManageSuccess] = useState<string | null>(null);

  async function handleMint() {
    if (!mintPriceData) return;
    setManageError(null);
    setManageSuccess(null);

    try {
      await writeContractAsync({
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "mint",
        args: [],
        value: mintPriceData as bigint,
      });
      setManageSuccess(
        "Mint submitted. Your cube will appear once the transaction confirms.",
      );
    } catch (err: any) {
      setManageError(err?.shortMessage || err?.message || "Mint failed.");
    }
  }

  async function handleSetPrimaryToken(e: React.FormEvent) {
    e.preventDefault();
    if (!hasCube) return;
    setManageError(null);
    setManageSuccess(null);

    try {
      const addr = primaryTokenInput.trim();
      if (!addr || !addr.startsWith("0x") || addr.length !== 42) {
        setManageError("Enter a valid token address (0x…).");
        return;
      }
      const sym = primarySymbolInput.trim();
      if (!sym) {
        setManageError("Enter a token symbol (up to 8 chars).");
        return;
      }

      await writeContractAsync({
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "setPrimaryToken",
        args: [addr as `0x${string}`, encodeBytes8Symbol(sym)],
      });

      setManageSuccess("Primary token updated for your cube.");
    } catch (err: any) {
      setManageError(err?.shortMessage || err?.message || "Update failed.");
    }
  }

  // ---------- Share helpers ----------

  function handleShareX() {
    if (!hasCube) return;
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : "https://baseblox.xyz";
    const text = encodeURIComponent(
      `My BaseBlox cube #${cubeId} on Base — ${ageDays} days old, ${prestigeLabel(
        prestigeLevel,
      )}, ${seasonName} season.`,
    );
    const shareUrl = `https://x.com/intent/tweet?text=${text}&url=${encodeURIComponent(
      url,
    )}`;
    if (typeof window !== "undefined") window.open(shareUrl, "_blank");
  }

  function handleShareFarcaster() {
    if (!hasCube) return;
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : "https://baseblox.xyz";
    const text = encodeURIComponent(
      `Checking in with my BaseBlox cube #${cubeId} — ${ageDays} days old, ${prestigeLabel(
        prestigeLevel,
      )}, ${seasonName} season.`,
    );
    const shareUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(
      url,
    )}`;
    if (typeof window !== "undefined") window.open(shareUrl, "_blank");
  }

  const latestCube = recentCubes[0];
  const otherRecent = recentCubes.slice(1);

  // ---------- UI ----------

  return (
    <section className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-10 sm:py-12 md:py-16 flex flex-col gap-8 text-slate-50">
      {/* soft page-level glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-64 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.40),transparent_60%)] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.30),transparent_60%)] opacity-60" />

      {/* Hero header card */}
      <header className="relative overflow-hidden rounded-3xl border border-sky-400/35 bg-gradient-to-br from-slate-900/90 via-sky-900/60 to-blue-950/90 px-5 py-6 sm:px-7 sm:py-7 shadow-[0_0_50px_rgba(15,23,42,0.9)]">
        <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.45),transparent_55%)] opacity-70" />
        <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.35),transparent_55%)] opacity-60" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 border border-sky-400/60 px-3 py-1 text-[11px] font-medium text-sky-100 uppercase tracking-[0.16em] shadow-sm shadow-sky-900/40">
              <span className="text-base">🟦</span>
              <span>BaseBlox Identity</span>
            </div>
            <h1 className="text-3xl sm:text-[2.1rem] font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                BaseBlox
              </span>{" "}
              – your onchain identity cube
            </h1>
            <p className="text-sm sm:text-[0.95rem] text-slate-200/90">
              One evolving cube per wallet. Age, prestige, season, and your
              primary token — all etched onchain on Base. Mint once and let your
              cube tell your story.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <CubeVisual
              tokenId={hasCube ? cubeId : undefined}
              label={hasCube ? "Your BaseBlox cube" : "BaseBlox cube"}
              size={132}
              imageSrc={mainCubeImage}
            />
          </div>
        </div>
      </header>

      {/* Main wrapper card */}
      <div className="stats-card stats-appear relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7 bg-gradient-to-b from-slate-900/85 via-slate-950/90 to-black/95 border border-slate-700/60 shadow-[0_0_60px_rgba(15,23,42,0.85)] rounded-[26px]">
        {/* soft background glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-56 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.40),transparent_60%)] opacity-70" />

        <div className="relative space-y-5">
          {/* Top row: cube visual + wallet */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <CubeVisual
                tokenId={hasCube ? cubeId : undefined}
                label={hasCube ? "Your cube" : "Base cube"}
                size={112}
                imageSrc={mainCubeImage}
              />
              <div className="flex flex-col justify-center gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold leading-tight text-slate-50">
                    {hasCube ? `Cube #${cubeId}` : "No cube yet"}
                  </h2>
                  {hasCube && (
                    <span className="pill bg-sky-500/20 text-sky-50 border border-sky-400/70">
                      {seasonName} season
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200/90">
                  {address ? truncateAddress(address) : "Connect wallet to begin"}
                </p>
                {hasCube && (
                  <p className="text-xs text-slate-300/85">
                    Minted{" "}
                    <span className="font-medium text-slate-50">
                      {mintedAtDate}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="self-start sm:self-center">
              <ConnectButton chainStatus="none" showBalance={false} />
            </div>
          </div>

          {/* Connection notice */}
          {(notConnected || noCubeYet) && (
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-3.5 text-xs text-slate-100/90">
              {notConnected && (
                <p>
                  Connect your Base wallet to see your BaseBlox cube stats and
                  identity.
                </p>
              )}
              {noCubeYet && (
                <p className="mt-1.5">
                  You don&apos;t have a cube yet. Mint one on Base to start
                  building your onchain identity.
                </p>
              )}
            </div>
          )}

          {/* Identity snapshot */}
          {hasCube && (
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 px-4 py-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Identity snapshot
                  </p>
                  <p className="text-xs text-slate-200/85">
                    Your cube evolves over time as your onchain story unfolds.
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-50">
                    {prestigeLabel(prestigeLevel)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Prestige level
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Age */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-3">
                  <p className="text-[11px] text-slate-400 mb-1">Age</p>
                  <p className="text-lg font-semibold text-slate-50">
                    {ageDays}
                    <span className="text-xs text-slate-400 ml-1">days</span>
                  </p>
                  <p className="text-[11px] text-slate-200 mt-0.5">
                    {ageTier.label}
                  </p>
                </div>

                {/* Season */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-3">
                  <p className="text-[11px] text-slate-400 mb-1">Season</p>
                  <p className="text-lg font-semibold text-slate-50">
                    {seasonName}
                  </p>
                  <p className="text-[11px] text-slate-200 mt-0.5">
                    {ageTier.subtitle}
                  </p>
                </div>

                {/* Prestige */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-3">
                  <p className="text-[11px] text-slate-400 mb-1">Prestige</p>
                  <p className="text-lg font-semibold text-slate-50">
                    {prestigeLevel}
                  </p>
                  <p className="text-[11px] text-slate-200 mt-0.5">
                    {prestigeLabel(prestigeLevel)}
                  </p>
                </div>

                {/* Primary token */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-3">
                  <p className="text-[11px] text-slate-400 mb-1">Primary token</p>
                  <p className="text-sm font-semibold text-slate-50">
                    {primarySymbol || "Not set"}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {truncateAddress(primaryToken)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mint overview */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 px-4 py-4">
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
              Mint overview
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-900/85 border border-slate-700 px-3 py-3">
                <p className="text-[11px] text-slate-400 mb-1">
                  Minted / Max supply
                </p>
                <p className="font-semibold text-slate-50">
                  {mintedCount}{" "}
                  <span className="text-slate-400 text-xs">
                    / {maxSupply || "100000"}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/85 border border-slate-700 px-3 py-3">
                <p className="text-[11px] text-slate-400 mb-1">Mint price</p>
                <p className="font-semibold text-slate-50">
                  {mintPriceEth}{" "}
                  <span className="text-slate-400 text-xs">ETH</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Promo mints left: {promoRemaining}
                </p>
              </div>
            </div>
          </div>

          {/* Mint & manage */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 px-4 py-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                  Mint & manage
                </p>
                <p className="text-xs text-slate-200/85">
                  Forge your cube or set your primary token.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!isConnected || hasCube || isWriting || !mintPriceData}
              onClick={handleMint}
              className={`w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border font-medium transition
              ${
                !isConnected || hasCube || !mintPriceData
                  ? "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-sky-500/25 border-sky-400/80 text-sky-50 hover:bg-sky-500/40"
              }`}
            >
              {!isConnected
                ? "Connect wallet to mint"
                : hasCube
                ? "One cube per wallet (already minted)"
                : isWriting
                ? "Minting..."
                : `Mint your cube for ${mintPriceEth} ETH`}
            </button>

            {hasCube && (
              <form
                onSubmit={handleSetPrimaryToken}
                className="mt-2 space-y-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 px-3 py-3.5"
              >
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
                  Primary token
                </p>
                <p className="text-[11px] text-slate-200/80 mb-1.5">
                  Link a token you&apos;re known for. Symbol is etched on the cube.
                </p>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">
                      Token address (Base)
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={primaryTokenInput}
                      onChange={(e) => setPrimaryTokenInput(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-50 outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">
                      Token symbol (max 8 chars)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. POT, TOBY"
                      value={primarySymbolInput}
                      onChange={(e) =>
                        setPrimarySymbolInput(e.target.value.toUpperCase())
                      }
                      maxLength={8}
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-50 outline-none focus:border-sky-400 tracking-[0.12em]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isWriting}
                  className={`mt-2 inline-flex items-center justify-center text-xs px-3 py-1.5 rounded-lg border transition ${
                    isWriting
                      ? "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-slate-900 border-slate-600 text-slate-100 hover:bg-slate-800/90"
                  }`}
                >
                  {isWriting ? "Updating..." : "Set primary token"}
                </button>

                {manageError && (
                  <p className="text-[11px] text-rose-400 mt-1">{manageError}</p>
                )}
                {manageSuccess && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    {manageSuccess}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Links */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 px-4 py-4">
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
              Links
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://basescan.org/address/${BASEBLOCKS_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/50 text-sky-50 hover:bg-sky-500/30 transition"
              >
                View contract on BaseScan
              </a>
              {hasCube && (
                <a
                  href={`https://basescan.org/token/${BASEBLOCKS_ADDRESS}?a=${cubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-900/85 border border-slate-600 text-slate-100 hover:bg-slate-800/95 transition"
                >
                  View cube #{cubeId} on Base
                </a>
              )}
              <a
                href="#"
                className="text-xs px-3 py-1.5 rounded-full bg-slate-900/85 border border-slate-600 text-slate-100 hover:bg-slate-800/95 transition"
              >
                Visit BaseBlox site
              </a>
            </div>
          </div>

          {/* Share CTA */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 px-4 py-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                  Share your cube
                </p>
                <p className="text-xs text-slate-200/85">
                  Cast or tweet your BaseBlox stats as a flex.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!hasCube}
                onClick={handleShareFarcaster}
                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                  hasCube
                    ? "bg-violet-500/20 border-violet-400/60 text-violet-50 hover:bg-violet-500/30"
                    : "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>Share on Farcaster</span>
              </button>

              <button
                type="button"
                disabled={!hasCube}
                onClick={handleShareX}
                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                  hasCube
                    ? "bg-slate-900 border-slate-500 text-slate-100 hover:bg-black"
                    : "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>Share on X</span>
              </button>
            </div>

            {!hasCube && (
              <p className="text-[10px] text-slate-400 mt-2">
                Mint a cube first to unlock sharing.
              </p>
            )}
          </div>

          {/* Freshly forged cubes */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 px-4 py-4">
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
              Freshly forged cubes
            </p>

            {recentCubes.length === 0 ? (
              <p className="text-xs text-slate-400">
                No cubes have been forged yet. Be the first mint on BaseBlox.
              </p>
            ) : (
              <div className="space-y-3">
                {latestCube && (
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-sky-500/25 via-blue-500/20 to-slate-900/90 border border-sky-400/70 px-3.5 py-3 shadow-md shadow-sky-900/50">
                    <div className="flex items-center gap-3">
                      <CubeVisual
                        tokenId={latestCube.tokenId}
                        label="Latest cube"
                        size={80}
                        imageSrc={latestCube.imageUrl}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-50">
                          Owner: {truncateAddress(latestCube.owner)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-100/80">Minted</p>
                      <p className="text-xs font-medium text-slate-50">
                        {latestCube.mintedAtDate}
                      </p>
                    </div>
                  </div>
                )}

                {otherRecent.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {otherRecent.map((item) => (
                      <div
                        key={item.tokenId}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <BlueCubeAvatar size={30} imageSrc={item.imageUrl} />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-50">
                              Cube #{item.tokenId}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Owner: {truncateAddress(item.owner)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-400">Minted</p>
                          <p className="text-xs text-slate-200">
                            {item.mintedAtDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Featured cubes */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 px-4 py-4">
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
              Featured cubes
            </p>
            <p className="text-xs text-slate-200/85 mb-3">
              Spotlighted BaseBlox identities. For now, just blue cube vibes. 🟦
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-800 px-3 py-3"
                >
                  <BlueCubeAvatar size={32} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-50">
                      Coming soon
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Curated Base cube
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

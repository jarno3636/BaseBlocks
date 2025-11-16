// app/page.tsx
"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
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

export default function Home() {
  const { address, isConnected } = useAccount();

  // --- Onchain reads ---

  // Which cube (if any) belongs to this wallet
  const { data: cubeIdData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "cubeOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: Boolean(address),
    },
  });

  const hasCube = !!cubeIdData && cubeIdData > 0n;
  const cubeId = hasCube ? Number(cubeIdData) : 0;

  // CubeData (mintedAt, prestigeLevel, primaryToken, primarySymbol)
  const { data: cubeData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "getCubeData",
    args: hasCube ? [cubeIdData!] : undefined,
    query: {
      enabled: hasCube,
    },
  });

  // Age in seconds
  const { data: ageSecondsData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "getAge",
    args: hasCube ? [cubeIdData!] : undefined,
    query: {
      enabled: hasCube,
    },
  });

  // Global stats
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

  // --- Derived UI values ---

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

  // --- UI states ---

  const notConnected = !isConnected;
  const noCubeYet = isConnected && !hasCube;

  return (
    <section className="w-full max-w-md flex flex-col gap-6">
      {/* Header above card */}
      <header className="text-center space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300/80">
          BaseBlocks
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Your blockchain identity in a Base cube
        </h1>
        <p className="text-sm text-slate-300/80 max-w-sm mx-auto">
          One evolving cube per wallet. Age, prestige, season, and your primary
          token – all etched onchain.
        </p>
      </header>

      {/* Main card */}
      <div className="stats-card stats-appear px-5 py-6 sm:px-6 sm:py-7">
        {/* Top row: cube avatar + status */}
        <div className="flex items-center gap-4">
          {/* Cube avatar placeholder – can swap for real SVG later */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-lg shadow-sky-900/70 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg border border-white/70 bg-sky-100/90" />
            <div className="absolute -inset-[2px] rounded-2xl border border-cyan-300/40 opacity-60" />
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold leading-tight">
                {hasCube ? `Cube #${cubeId}` : "No cube yet"}
              </h2>
              {hasCube && (
                <span className="pill bg-sky-500/15 text-sky-200 border border-sky-500/40">
                  {seasonName}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300/90">
              {address ? truncateAddress(address) : "Connect wallet to begin"}
            </p>

            {hasCube && (
              <p className="text-xs text-slate-400">
                Minted: <span>{mintedAtDate}</span>
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-5 mb-4">
          <hr className="hr-soft" />
        </div>

        {/* State explanations */}
        {notConnected && (
          <p className="text-xs text-slate-300/80 mb-3">
            Connect your Base wallet to see your BaseBlocks cube stats and
            identity.
          </p>
        )}

        {noCubeYet && (
          <p className="text-xs text-slate-300/80 mb-3">
            You don&apos;t have a cube yet. Mint one on Base to start building
            your onchain identity.
          </p>
        )}

        {/* Identity snapshot */}
        {hasCube && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Identity Snapshot
                </p>
                <p className="text-sm text-slate-300/90">
                  Your cube evolves over time as your onchain story unfolds.
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold">
                  {prestigeLabel(prestigeLevel)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Prestige level
                </span>
              </div>
            </div>

            {/* Main stats grid */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Age */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
                <p className="text-[11px] text-slate-400 mb-1">Age</p>
                <p className="text-lg font-semibold">
                  {ageDays}
                  <span className="text-xs text-slate-400 ml-1">days</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {ageTier.label}
                </p>
              </div>

              {/* Season */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
                <p className="text-[11px] text-slate-400 mb-1">Season</p>
                <p className="text-lg font-semibold">{seasonName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {ageTier.subtitle}
                </p>
              </div>

              {/* Prestige */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
                <p className="text-[11px] text-slate-400 mb-1">Prestige</p>
                <p className="text-lg font-semibold">{prestigeLevel}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {prestigeLabel(prestigeLevel)}
                </p>
              </div>

              {/* Primary token */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
                <p className="text-[11px] text-slate-400 mb-1">Primary token</p>
                <p className="text-sm font-semibold">
                  {primarySymbol || "Not set"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {truncateAddress(primaryToken)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Global / mint info – always useful */}
        <div className="mt-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
            Mint overview
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 px-3 py-3">
              <p className="text-[11px] text-slate-400 mb-1">
                Minted / Max supply
              </p>
              <p className="font-semibold">
                {mintedCount}{" "}
                <span className="text-slate-400 text-xs">
                  / {maxSupply || "100000"}
                </span>
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 px-3 py-3">
              <p className="text-[11px] text-slate-400 mb-1">Mint price</p>
              <p className="font-semibold">
                {mintPriceEth}{" "}
                <span className="text-slate-400 text-xs">ETH</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Promo mints left: {promoRemaining}
              </p>
            </div>
          </div>
        </div>

        {/* Links row – wire these up to your real URLs */}
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
            Links
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://basescan.org/address/${BASEBLOCKS_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-100 hover:bg-sky-500/25 transition"
            >
              View contract on BaseScan
            </a>
            {hasCube && (
              <a
                href={`https://basescan.org/token/${BASEBLOCKS_ADDRESS}?a=${cubeId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-600 text-slate-100 hover:bg-slate-800/90 transition"
              >
                View cube #{cubeId} on Base
              </a>
            )}
            <a
              href="#"
              className="text-xs px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-600 text-slate-100 hover:bg-slate-800/90 transition"
            >
              Visit BaseBlocks site
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

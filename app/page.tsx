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
import ShareSection from "@/components/ShareSection";

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
    if (i < trimmed.length) bytes.push(trimmed.charCodeAt(i));
    else bytes.push(0);
  }
  let hex = "0x";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex as `0x${string}`;
}

function ageTierLabel(ageDays: number): { label: string; subtitle: string } {
  if (ageDays < 7) return { label: "Fresh Mint", subtitle: "Newly forged cube" };
  if (ageDays < 30) return { label: "Settling In", subtitle: "Finding its place" };
  if (ageDays < 90) return { label: "Seasoned", subtitle: "Building history" };
  if (ageDays < 180) return { label: "Established", subtitle: "Recognized identity" };
  if (ageDays < 365) return { label: "Veteran", subtitle: "Deep onchain roots" };
  if (ageDays < 730) return { label: "Elder Cube", subtitle: "Years on Base" };
  return { label: "Ancient Block", subtitle: "A true onchain relic" };
}

function prestigeLabel(prestige: number): string {
  if (prestige === 0) return "Unprestiged";
  if (prestige === 1) return "Prestige I";
  if (prestige === 2) return "Prestige II";
  if (prestige === 3) return "Prestige III";
  if (prestige === 4) return "Prestige IV";
  if (prestige === 5) return "Prestige V";
  if (prestige === 6) return "Prestige VI";
  if (prestige === 7) return "Prestige VII";
  if (prestige === 8) return "Prestige VIII";
  if (prestige === 9) return "Prestige IX";
  return `Prestige ${prestige}`;
}

/** Try to extract an image URL from a tokenURI. */
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

// Larger “NFT-style” cube render
function CubeVisual({
  tokenId,
  label = "Base cube",
  size = 120,
  imageSrc,
  showMeta = true,
}: {
  tokenId?: number;
  label?: string;
  size?: number;
  imageSrc?: string;
  showMeta?: boolean;
}) {
  const cardWidth = size * 1.5;

  return (
    <div
      className="relative rounded-3xl border border-sky-400/50 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-slate-900/95 shadow-2xl shadow-sky-900/60 overflow-hidden"
      style={{ width: cardWidth }}
    >
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

        {showMeta && (
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
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  // ---------- Onchain reads: primary cube (cubeOf) + global state ----------

  // "Minted identity cube" mapping
  const { data: cubeIdData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "cubeOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: Boolean(address) },
  });

  const hasMintedCube = !!cubeIdData && cubeIdData > 0n;
  const mintedCubeId = hasMintedCube ? Number(cubeIdData) : 0;

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

  // ---------- Featured promo cubes (tokenIds 2–5 once minted) ----------

  const featuredTokenIds = useMemo(() => {
    const ids: bigint[] = [];
    if (!nextTokenIdData) return ids;
    // token is minted if id < nextTokenId
    for (let id = 2; id <= 5; id++) {
      const bid = BigInt(id);
      if (bid < nextTokenIdData) ids.push(bid);
    }
    return ids;
  }, [nextTokenIdData]);

  const { data: featuredResults } = useReadContracts({
    contracts: featuredTokenIds.flatMap((id) => [
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
    query: { enabled: featuredTokenIds.length > 0 },
  });

  const featuredCubes = useMemo(() => {
    if (!featuredResults || featuredResults.length === 0) return [];
    const out: { tokenId: number; imageUrl?: string }[] = [];

    for (let i = 0; i < featuredTokenIds.length; i++) {
      const tokenId = Number(featuredTokenIds[i]);
      const tokenUriRes = featuredResults[i * 2 + 1];
      const tokenUri = tokenUriRes?.result as string | undefined;
      const imageUrl = extractImageFromTokenUri(tokenUri);

      out.push({ tokenId, imageUrl });
    }

    return out;
  }, [featuredResults, featuredTokenIds]);

  // ---------- Robust-ish scan: other cubes owned by this wallet ----------

  const ownedScanTokenIds = useMemo(() => {
    if (!address || !nextTokenIdData || nextTokenIdData <= 1n) {
      return [] as bigint[];
    }
    const last = Number(nextTokenIdData) - 1;
    const mintedCount = last;
    // Scan up to the last 256 cubes; if total minted <= 256, this covers all.
    const windowSize = Math.min(mintedCount, 256);
    const first = last - windowSize + 1;
    const ids: bigint[] = [];
    for (let id = last; id >= first; id--) {
      ids.push(BigInt(id));
    }
    return ids;
  }, [address, nextTokenIdData]);

  const { data: ownedScanResults } = useReadContracts({
    contracts: ownedScanTokenIds.map((id) => ({
      address: BASEBLOCKS_ADDRESS,
      abi: BASEBLOCKS_ABI,
      functionName: "ownerOf",
      args: [id],
    })) as const,
    query: { enabled: Boolean(address && ownedScanTokenIds.length > 0) },
  });

  const extraOwnedCubes = useMemo(() => {
    if (!address || !ownedScanResults || ownedScanResults.length === 0) {
      return [] as number[];
    }
    const lower = address.toLowerCase();
    const extras: number[] = [];

    ownedScanTokenIds.forEach((id, idx) => {
      const owner = ownedScanResults[idx]?.result as string | undefined;
      if (owner && owner.toLowerCase() === lower) {
        const numericId = Number(id);
        // skip the primary cubeOf(address) in this list
        if (!hasMintedCube || numericId !== mintedCubeId) {
          extras.push(numericId);
        }
      }
    });

    extras.sort((a, b) => a - b);
    return extras;
  }, [address, ownedScanResults, ownedScanTokenIds, hasMintedCube, mintedCubeId]);

  // All cubes we know this wallet owns (primary + extras)
  const allOwnedCubes = useMemo(() => {
    const ids = new Set<number>();
    if (hasMintedCube) ids.add(mintedCubeId);
    extraOwnedCubes.forEach((id) => ids.add(id));
    return Array.from(ids).sort((a, b) => a - b);
  }, [hasMintedCube, mintedCubeId, extraOwnedCubes]);

  const hasAnyCube = allOwnedCubes.length > 0;

  // ---------- Active (display) cube selection ----------

  const [activeCubeId, setActiveCubeId] = useState<number | null>(null);

  // The cube we actually show stats + art for
  const effectiveCubeId = useMemo(() => {
    if (activeCubeId != null) return activeCubeId;
    if (allOwnedCubes.length > 0) return allOwnedCubes[0];
    return null;
  }, [activeCubeId, allOwnedCubes]);

  const effectiveCubeIdBig =
    effectiveCubeId != null ? BigInt(effectiveCubeId) : null;

  // Reads for the *active* cube
  const { data: activeCubeData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "getCubeData",
    args: effectiveCubeIdBig ? [effectiveCubeIdBig] : undefined,
    query: { enabled: Boolean(effectiveCubeIdBig) },
  });

  const { data: activeAgeSecondsData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "getAge",
    args: effectiveCubeIdBig ? [effectiveCubeIdBig] : undefined,
    query: { enabled: Boolean(effectiveCubeIdBig) },
  });

  const { data: activeTokenUriData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "tokenURI",
    args: effectiveCubeIdBig ? [effectiveCubeIdBig] : undefined,
    query: { enabled: Boolean(effectiveCubeIdBig) },
  });

  // ---------- Derived for active cube ----------

  const {
    activeAgeDays,
    activeAgeTier,
    activePrestigeLevel,
    activePrimaryToken,
    activePrimarySymbol,
    activeMintedAtDate,
  } = useMemo(() => {
    if (!effectiveCubeIdBig || !activeCubeData) {
      return {
        activeAgeDays: 0,
        activeAgeTier: ageTierLabel(0),
        activePrestigeLevel: 0,
        activePrimaryToken: undefined as string | undefined,
        activePrimarySymbol: "",
        activeMintedAtDate: "—",
      };
    }

    const seconds = activeAgeSecondsData ? Number(activeAgeSecondsData) : 0;
    const days = Math.floor(seconds / 86400);

    const prestige = activeCubeData
      ? Number((activeCubeData as any).prestigeLevel)
      : 0;
    const primaryTokenAddr = activeCubeData
      ? (activeCubeData as any).primaryToken
      : undefined;
    const primarySymbolBytes = activeCubeData
      ? (activeCubeData as any).primarySymbol
      : undefined;

    const mintedAtSeconds = activeCubeData
      ? Number((activeCubeData as any).mintedAt)
      : 0;
    const mintedAt =
      mintedAtSeconds > 0
        ? new Date(mintedAtSeconds * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—";

    return {
      activeAgeDays: days,
      activeAgeTier: ageTierLabel(days),
      activePrestigeLevel: prestige,
      activePrimaryToken: primaryTokenAddr as string | undefined,
      activePrimarySymbol: decodeBytes8Symbol(
        primarySymbolBytes as string | undefined,
      ),
      activeMintedAtDate: mintedAt,
    };
  }, [effectiveCubeIdBig, activeCubeData, activeAgeSecondsData]);

  const mintedCount = nextTokenIdData ? Number(nextTokenIdData) - 1 : 0;
  const maxSupply = maxSupplyData ? Number(maxSupplyData) : 0;
  const promoRemaining = promoRemainingData ? Number(promoRemainingData) : 0;
  const mintPriceEth = mintPriceData ? formatEther(mintPriceData) : "0";

  const notConnected = !isConnected;
  const noCubeYet = isConnected && !hasAnyCube;

  const activeCubeImage = extractImageFromTokenUri(
    activeTokenUriData as string | undefined,
  );

  // when user does NOT have any cube (connected or not), show fallback.PNG.
  const myCubeImageToShow =
    effectiveCubeId != null && activeCubeImage ? activeCubeImage : "/fallback.PNG";

  // prestige timing: 180 days between prestiges
  const canPrestige = effectiveCubeId != null && activeAgeDays >= 180;
  const prestigeCooldownDays =
    effectiveCubeId != null && activeAgeDays < 180 ? 180 - activeAgeDays : 0;

  const activePrestigeLabelText = prestigeLabel(activePrestigeLevel);

  // ---------- Local state for manage actions ----------

  const [primaryTokenInput, setPrimaryTokenInput] = useState("");
  const [primarySymbolInput, setPrimarySymbolInput] = useState("");
  const [manageError, setManageError] = useState<string | null>(null);
  const [manageSuccess, setManageSuccess] = useState<string | null>(null);
  const [showMintCongrats, setShowMintCongrats] = useState(false);

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
      setShowMintCongrats(true);
    } catch (err: any) {
      setManageError(err?.shortMessage || err?.message || "Mint failed.");
    }
  }

  async function handleSetPrimaryToken(e: React.FormEvent) {
    e.preventDefault();
    if (effectiveCubeId == null) return;
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

  async function handlePrestige() {
    if (effectiveCubeId == null) return;
    setManageError(null);
    setManageSuccess(null);

    try {
      await writeContractAsync({
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "prestige",
        args: [BigInt(effectiveCubeId)],
      });

      setManageSuccess(
        "Prestige submitted. When it confirms, your badge and card visuals will level up.",
      );
    } catch (err: any) {
      setManageError(err?.shortMessage || err?.message || "Prestige failed.");
    }
  }

  const latestCube = recentCubes[0];
  const otherRecent = recentCubes.slice(1);
  const gridRecent = otherRecent.slice(0, 4); // up to 4 in the 2x2 grid

  // ---------- UI ----------

  return (
    <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16 flex flex-col gap-8 text-slate-50">
      {/* soft page-level glows */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-64 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.40),transparent_60%)] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.30),transparent_60%)] opacity-60" />

      {/* HERO CARD */}
      <div className="glass-card stats-appear overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.45),transparent_55%)] opacity-80" />
        <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.35),transparent_55%)] opacity-70" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-1 text-center md:text-left space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-sky-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                BaseBlox
              </span>
            </h1>

            {/* subtle divider between title and body */}
            <div className="mt-3 mb-4 h-px w-24 mx-auto md:mx-0 bg-gradient-to-r from-sky-300/90 via-cyan-200/90 to-transparent" />

            <p className="text-sm sm:text-base text-slate-200/90 max-w-xl mx-auto md:mx-0">
              Your evolving onchain identity cube. One cube per wallet — age,
              prestige level, and your primary token, all etched on Base.
              Mint once and let your cube tell your story.
            </p>
          </div>

          <div className="flex-1 flex justify-center">
            <Image
              src="/hero.PNG"
              alt="BaseBlox hero"
              width={360}
              height={360}
              className="hero-float w-full max-w-xs sm:max-w-sm rounded-2xl shadow-xl shadow-sky-900/50"
            />
          </div>
        </div>
      </div>

      {/* Content cards */}
      <div className="relative mt-8 flex flex-col gap-8 sm:gap-10 md:gap-12">
        {/* Combined: your cube + identity snapshot */}
        <div className="glass-card stats-appear overflow-hidden px-4 py-4 sm:px-5 sm:py-6">
          <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.32),transparent_60%)] opacity-80" />
          <div className="relative space-y-4">
            {/* Top row: cube + wallet */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex justify-center sm:justify-start">
                {/* NOTE: cube itself does NOT animate */}
                <CubeVisual
                  tokenId={effectiveCubeId ?? undefined}
                  label={
                    effectiveCubeId != null
                      ? "Your BaseBlox cube"
                      : "BaseBlox cube"
                  }
                  size={336} // big hero cube
                  imageSrc={myCubeImageToShow}
                  showMeta={false}
                />
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {/* "Your cube" title + line */}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Your cube
                  </p>
                  <div className="mt-1 mb-4 h-px w-16 bg-gradient-to-r from-sky-300/90 via-cyan-200/90 to-transparent" />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold leading-tight text-slate-50">
                        {effectiveCubeId != null
                          ? `Cube #${effectiveCubeId}`
                          : "No cube yet"}
                      </h2>
                      <p className="mt-1 text-xs text-slate-200/90">
                        {address
                          ? truncateAddress(address)
                          : "Connect a Base wallet to begin"}
                      </p>
                      {effectiveCubeId != null && (
                        <p className="text-xs text-slate-300/85">
                          Minted{" "}
                          <span className="font-medium text-slate-50">
                            {activeMintedAtDate}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="self-start">
                      <ConnectButton chainStatus="none" showBalance={false} />
                    </div>
                  </div>

                  {allOwnedCubes.length > 1 && effectiveCubeId != null && (
                    <div>
                      <p className="text-[11px] text-slate-400 mb-1">
                        Active cube
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {allOwnedCubes.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() =>
                              setActiveCubeId(
                                id === effectiveCubeId ? null : id,
                              )
                            }
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                              id === effectiveCubeId
                                ? "bg-sky-500/30 border-sky-400 text-sky-50"
                                : "bg-slate-900/80 border-slate-600 text-slate-200 hover:bg-slate-800/90"
                            }`}
                          >
                            #{id}
                            {id === effectiveCubeId ? " (active)" : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(notConnected || noCubeYet) && (
              <div className="rounded-2xl bg-slate-950/70 px-4 py-3.5 text-xs text-slate-100/90">
                {notConnected && (
                  <p>
                    Connect your Base wallet to see your BaseBlox cube stats and
                    identity.
                  </p>
                )}
                {noCubeYet && (
                  <p className="mt-1.5">
                    You don&apos;t have a cube yet. Mint or acquire one on Base
                    to start building your onchain identity.
                  </p>
                )}
              </div>
            )}

            {/* Identity snapshot inline in same card */}
            {effectiveCubeId != null && (
              <div className="mt-1 space-y-3">
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
                      {activePrestigeLabelText}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Prestige level
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-900/80 px-3 py-3">
                    <p className="text-[11px] text-slate-400 mb-1">Age</p>
                    <p className="text-lg font-semibold text-slate-50">
                      {activeAgeDays}
                      <span className="text-xs text-slate-400 ml-1">days</span>
                    </p>
                    <p className="text-[11px] text-slate-200 mt-0.5">
                      {activeAgeTier.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Prestige unlocks roughly every 180 days.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-900/80 px-3 py-3">
                    <p className="text-[11px] text-slate-400 mb-1">Prestige</p>
                    <p className="text-lg font-semibold text-slate-50">
                      {activePrestigeLevel}
                    </p>
                    <p className="text-[11px] text-slate-200 mt-0.5">
                      {activePrestigeLabelText}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Your badge upgrades over time — outlined stars first,
                      then solid gold, then a gold ring at higher levels.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-900/80 px-3 py-3">
                    <p className="text-[11px] text-slate-400 mb-1">
                      Primary token
                    </p>
                    <p className="text-sm font-semibold text-slate-50">
                      {activePrimarySymbol || "Not set"}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {truncateAddress(activePrimaryToken)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mint overview */}
        <div className="glass-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
            Mint overview
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-900/85 px-3 py-3">
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
            <div className="rounded-2xl bg-slate-900/85 px-3 py-3">
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
        <div className="glass-card px-4 py-4 sm:px-5 sm:py-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                Mint & manage
              </p>
              <p className="text-xs text-slate-200/85">
                Forge your cube, set a primary token, and prestige over time.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!isConnected || hasMintedCube || isWriting || !mintPriceData}
            onClick={handleMint}
            className={`w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border font-medium transition
              ${
                !isConnected || hasMintedCube || !mintPriceData
                  ? "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-sky-500/25 border-sky-400/80 text-sky-50 hover:bg-sky-500/40"
              }`}
          >
            {!isConnected
              ? "Connect wallet to mint"
              : hasMintedCube
              ? "One cube per wallet (already minted)"
              : isWriting
              ? "Minting..."
              : `Mint your cube for ${mintPriceEth} ETH`}
          </button>

          {/* Prestige section */}
          {effectiveCubeId != null && (
            <div className="mt-2 rounded-2xl bg-slate-900/90 px-3 py-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                    Prestige
                  </p>
                  <p className="text-[11px] text-slate-200/80">
                    Every ~6 months of age you can prestige, resetting your age
                    and upgrading the badge on your card. Come back here when
                    your active cube is old enough to level up again.
                  </p>
                </div>
                <span className="text-xs text-slate-300">
                  Level {activePrestigeLevel}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrestige}
                disabled={!canPrestige || isWriting}
                className={`w-full inline-flex items-center justify-center text-xs px-3 py-1.75 rounded-lg border transition ${
                  !canPrestige || isWriting
                    ? "bg-slate-900/60 border-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-amber-500/15 border-amber-400/70 text-amber-100 hover:bg-amber-500/25"
                }`}
              >
                {isWriting
                  ? "Submitting..."
                  : canPrestige
                  ? "Prestige your active cube"
                  : `Prestige available in ${prestigeCooldownDays} days`}
              </button>
            </div>
          )}

          {effectiveCubeId != null && (
            <form
              onSubmit={handleSetPrimaryToken}
              className="mt-2 space-y-2.5 rounded-2xl bg-slate-900/90 px-3 py-3.5"
            >
              <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1">
                Primary token
              </p>
              <p className="text-[11px] text-slate-200/80 mb-1.5">
                Link a token you&apos;re known for. Symbol is etched on the
                active cube.
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
                    className="w-full rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs text-slate-50 outline-none focus:border-sky-400 border border-slate-700/70"
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
                    className="w-full rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs text-slate-50 outline-none focus:border-sky-400 tracking-[0.12em] border border-slate-700/70"
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
                {isWriting ? "Updating..." : "Set primary token for active cube"}
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
        <div className="glass-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
            Links
          </p>
          <div className="flex flex-wrap gap-2">
            {effectiveCubeId != null && (
              <a
                href={`https://basescan.org/token/${BASEBLOCKS_ADDRESS}?a=${effectiveCubeId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-full bg-slate-900/85 border border-slate-600 text-slate-100 hover:bg-slate-800/95 transition"
              >
                View active cube #{effectiveCubeId} on Base
              </a>
            )}
          </div>

          {extraOwnedCubes.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] text-slate-400 mb-1">
                Other cubes in this wallet (last 256 mints scanned)
              </p>
              <div className="flex flex-wrap gap-2">
                {extraOwnedCubes.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setActiveCubeId(id === effectiveCubeId ? null : id)
                    }
                    className={`text-[11px] px-3 py-1.5 rounded-full border transition ${
                      id === effectiveCubeId
                        ? "bg-sky-500/30 border-sky-400 text-sky-50"
                        : "bg-slate-900/85 border-slate-600 text-slate-100 hover:bg-slate-800/95"
                    }`}
                  >
                    Cube #{id}
                    {id === effectiveCubeId ? " (active)" : ""}
                  </button>
                ))}
              </div>
              {effectiveCubeId != null && (
                <p className="mt-1 text-[10px] text-slate-500">
                  Your BaseBlox identity on this page follows the active cube,
                  but these cubes are also held by your wallet. For very old
                  mints outside the last 256, check BaseScan directly.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ⬇️ Shared component: Share your cube + Share BaseBlox */}
        <ShareSection
          hasCube={effectiveCubeId != null}
          cubeId={effectiveCubeId ?? 0}
          ageDays={activeAgeDays}
          prestigeLabelText={activePrestigeLabelText}
          primarySymbol={activePrimarySymbol}
        />

        {/* Freshly forged cubes – latest centered, then 2x2 grid */}
        <div className="glass-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
            Freshly forged cubes
          </p>

          {recentCubes.length === 0 ? (
            <p className="text-xs text-slate-400">
              No cubes have been forged yet. Be the first mint on BaseBlox.
            </p>
          ) : (
            <div className="space-y-4">
              {latestCube && (
                <div className="flex justify-center">
                  <CubeVisual
                    tokenId={latestCube.tokenId}
                    label={`Cube #${latestCube.tokenId}`}
                    size={96}
                    imageSrc={latestCube.imageUrl}
                  />
                </div>
              )}

              {gridRecent.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {gridRecent.map((item) => (
                    <div
                      key={item.tokenId}
                      className="rounded-2xl bg-slate-900/90 px-3 py-3 flex flex-col items-center gap-2"
                    >
                      <CubeVisual
                        tokenId={item.tokenId}
                        label={`Cube #${item.tokenId}`}
                        size={80}
                        imageSrc={item.imageUrl}
                        showMeta={false}
                      />
                      <span className="text-xs font-semibold text-slate-50">
                        Cube #{item.tokenId}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Featured cubes (promo mints 2–5) */}
        <div className="glass-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-2">
            Featured cubes
          </p>
          <p className="text-xs text-slate-200/85 mb-3">
            Promo BaseBlox cubes. Early identity cards forged via promo mints.
          </p>

          {featuredCubes.length === 0 ? (
            <p className="text-xs text-slate-400">
              Promo cubes #2 – #5 will appear here once they are minted.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {featuredCubes.map((item) => (
                <div
                  key={item.tokenId}
                  className="flex items-center gap-2 rounded-2xl bg-slate-900/90 px-3 py-3"
                >
                  <BlueCubeAvatar size={32} imageSrc={item.imageUrl} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-50">
                      Cube #{item.tokenId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Promo mint identity
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contract link at very bottom of page */}
        <div className="mt-6 mb-2 flex justify-center">
          <a
            href={`https://basescan.org/address/${BASEBLOCKS_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs sm:text-sm px-4 py-2 rounded-full bg-sky-500/20 border border-sky-500/60 text-sky-50 hover:bg-sky-500/30 transition"
          >
            View BaseBlox contract on BaseScan
          </a>
        </div>
      </div>

      {/* Mint confirmation popup */}
      {showMintCongrats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowMintCongrats(false)}
          />
          {/* card */}
          <div className="relative z-50 max-w-sm w-full rounded-3xl border border-sky-400/70 bg-slate-950/95 px-6 py-6 shadow-[0_0_60px_rgba(56,189,248,.6)]">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="text-4xl">🎉</div>
              <h2 className="text-lg font-semibold text-slate-50">
                Cube mint submitted
              </h2>
              <p className="text-sm text-slate-300">
                Once your transaction confirms, your BaseBlox cube will appear
                above and start aging on Base. One cube per wallet.
              </p>
              <button
                type="button"
                onClick={() => setShowMintCongrats(false)}
                className="mt-2 inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-500/20 border border-sky-400/70 text-sky-50 hover:bg-sky-500/30 transition"
              >
                Nice, let it cook ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

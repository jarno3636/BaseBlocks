"use client";

import { useCube } from "@/hooks/useCube";
import { extractImageFromTokenUri } from "@/lib/extractImage";
import CubeVisual from "@/components/CubeVisual";
import { decodeSymbol, prestigeLabel } from "@/lib/cubeUtils";
import Link from "next/link";
import { BASEBLOCKS_ADDRESS } from "@/lib/baseblocksAbi";

export default function CubePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { cubeData, tokenUri } = useCube(id);

  const image = extractImageFromTokenUri(tokenUri as string | undefined);
  const prestige = cubeData ? Number((cubeData as any).prestigeLevel) : 0;
  const minted = cubeData ? Number((cubeData as any).mintedAt) : 0;

  const primaryToken = cubeData ? (cubeData as any).primaryToken : "";
  const primarySymbol = decodeSymbol(cubeData ? (cubeData as any).primarySymbol : "");

  const mintedDate =
    minted > 0
      ? new Date(minted * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-10 text-slate-50 space-y-10">
      <h1 className="text-4xl font-bold text-center">BaseBlox Cube #{id}</h1>

      <div className="flex justify-center">
        <CubeVisual
          tokenId={Number(id)}
          size={300}
          label={`Cube #${id}`}
          imageSrc={image}
        />
      </div>

      <div className="glass-card px-4 py-5 space-y-3">
        <p className="text-sm text-slate-200">
          <strong>Prestige:</strong> {prestigeLabel(prestige)}
        </p>

        <p className="text-sm text-slate-200">
          <strong>Minted:</strong> {mintedDate}
        </p>

        <p className="text-sm text-slate-200">
          <strong>Primary Token:</strong>{" "}
          {primarySymbol || <span className="text-slate-500">Not set</span>}
        </p>

        <p className="text-xs text-slate-500 break-all">
          Token Address: {primaryToken}
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          className="text-xs px-4 py-2 rounded-full bg-sky-500/20 border border-sky-500/50 text-sky-100 hover:bg-sky-500/30 transition"
          href={`https://basescan.org/token/${BASEBLOCKS_ADDRESS}?a=${id}`}
          target="_blank"
        >
          View on BaseScan
        </Link>
      </div>
    </section>
  );
}

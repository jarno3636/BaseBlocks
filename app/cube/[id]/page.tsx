"use client";

import Image from "next/image";
import { useCube } from "@/hooks/useCube";
import { extractImageFromTokenUri } from "@/lib/extractImage";
import CubeVisual from "@/components/CubeVisual"; // optional – or inline

export default function CubePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { cubeData, tokenUri } = useCube(id);

  const image = extractImageFromTokenUri(tokenUri as string);

  const prestige = cubeData ? Number((cubeData as any).prestigeLevel) : 0;
  const mintedAtSeconds = cubeData ? Number((cubeData as any).mintedAt) : 0;

  const mintedDate =
    mintedAtSeconds > 0
      ? new Date(mintedAtSeconds * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const primarySymbol = cubeData ? (cubeData as any).primarySymbol : "";
  const primaryToken = cubeData ? (cubeData as any).primaryToken : "";

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-10 text-slate-50 space-y-10">
      <h1 className="text-4xl font-bold">BaseBlox Cube #{id}</h1>

      <div className="flex justify-center">
        <CubeVisual
          tokenId={Number(id)}
          size={260}
          label={`Cube #${id}`}
          imageSrc={image}
        />
      </div>

      <div className="glass-card px-4 py-5 space-y-3">
        <p className="text-sm text-slate-300">
          <strong>Prestige:</strong> {prestige}
        </p>
        <p className="text-sm text-slate-300">
          <strong>Minted:</strong> {mintedDate}
        </p>
        <p className="text-sm text-slate-300">
          <strong>Primary token:</strong> {primarySymbol || "Not set"}
        </p>
        <p className="text-xs text-slate-500 break-all">
          Token address: {primaryToken}
        </p>
      </div>
    </section>
  );
}

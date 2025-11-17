// components/CubeVisual.tsx
"use client";

import Image from "next/image";

export default function CubeVisual({
  tokenId,
  label = "BaseBlox Cube",
  size = 160,
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
      className="relative rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-slate-900/90 shadow-xl shadow-sky-900/50 overflow-hidden"
      style={{ width: cardWidth }}
    >
      <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),transparent_60%)] opacity-70" />

      <div className="relative flex flex-col items-center gap-3 px-4 pt-4 pb-4">
        <div
          className="relative flex items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-2xl shadow-sky-900/60 overflow-hidden"
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
            <div className="w-[70%] h-[70%] rounded-2xl border border-white/60 bg-sky-50/80 shadow-inner shadow-sky-900/40" />
          )}
        </div>

        {showMeta && (
          <div className="w-full flex items-center justify-between text-[11px] text-slate-100/90">
            <span className="font-medium uppercase tracking-[0.15em]">
              {label}
            </span>
            {tokenId !== undefined && (
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 border border-sky-400/40 text-[10px]">
                #{tokenId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// app/api/baseblox/card/[id]/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { BASEBLOCKS_ABI, BASEBLOCKS_ADDRESS } from "@/lib/baseblocksAbi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

function decodeTokenJSON(uri: string): any | null {
  if (!uri?.startsWith?.("data:application/json;base64,")) return null;
  try {
    const b64 = uri.split(",")[1] || "";
    const jsonStr = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export async function GET(_req: Request, ctx: any) {
  const idStr = String(ctx?.params?.id ?? "");
  const idNum = Number(idStr);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const rpcUrl =
    process.env.NEXT_PUBLIC_BASE_RPC ||
    process.env.RPC_URL ||
    "https://mainnet.base.org";

  const client = createPublicClient({ chain: base, transport: http(rpcUrl) });

  try {
    const tokenURI = await client.readContract({
      address: BASEBLOCKS_ADDRESS,
      abi: BASEBLOCKS_ABI,
      functionName: "tokenURI",
      args: [BigInt(idNum)],
    });

    if (typeof tokenURI !== "string") throw new Error("no tokenURI");
    const meta = decodeTokenJSON(tokenURI);
    const imageField: string | undefined = meta?.image;
    if (!imageField) {
      return NextResponse.json({ error: "no image" }, { status: 404 });
    }

    const TW_W = 1200;
    const TW_H = 630;
    const bg = { r: 2, g: 6, b: 23, alpha: 1 as const };

    async function letterboxToCard(buf: Buffer) {
      const fitted = await sharp(buf)
        .resize(TW_W, TW_H, {
          fit: "inside",
          background: bg,
        })
        .toBuffer();

      return sharp({
        create: {
          width: TW_W,
          height: TW_H,
          channels: 4,
          background: bg,
        },
      })
        .composite([{ input: fitted, gravity: "center" }])
        .jpeg({ quality: 92 })
        .toBuffer();
    }

    // SVG → PNG → card
    if (imageField.startsWith("data:image/svg+xml")) {
      const base64 = imageField.split(",")[1] || "";
      const svgRaw = Buffer.from(base64, "base64");
      const squarePng = await sharp(svgRaw)
        .resize(1024, 1024, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

      const finalCard = await letterboxToCard(squarePng);
      return new NextResponse(finalCard, {
        headers: {
          "content-type": "image/jpeg",
          "cache-control":
            "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
        },
      });
    }

    // HTTP image → card
    if (/^https?:\/\//i.test(imageField)) {
      const r = await fetch(imageField);
      if (!r.ok) throw new Error("fetch image failed");
      const buf = Buffer.from(await r.arrayBuffer());
      const finalCard = await letterboxToCard(buf);
      return new NextResponse(finalCard, {
        headers: {
          "content-type": "image/jpeg",
          "cache-control":
            "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
        },
      });
    }

    return NextResponse.json(
      { error: "unsupported image format" },
      { status: 415 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "failed" },
      { status: 500 },
    );
  }
}

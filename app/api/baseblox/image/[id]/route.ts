// app/api/baseblox/image/[id]/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { BASEBLOCKS_ABI, BASEBLOCKS_ADDRESS } from "@/lib/baseblocksAbi";

export const runtime = "nodejs";
export const revalidate = 300;
export const dynamic = "force-dynamic";

// Decode tokenURI like: data:application/json;base64,<B64>
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

export async function GET(_req: NextRequest, { params }: any) {
  const idStr = params?.id;
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
    const imageField = meta?.image as string | undefined;

    if (!imageField) {
      return NextResponse.json({ error: "no image" }, { status: 404 });
    }

    // Inline SVG → PNG
    if (imageField.startsWith("data:image/svg+xml")) {
      const base64 = imageField.split(",")[1] || "";
      const svgRaw = Buffer.from(base64, "base64").toString("utf8");
      if (!svgRaw) throw new Error("bad svg");

      const png = await sharp(Buffer.from(svgRaw))
        .resize(1024, 1024, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

      return new NextResponse(png, {
        status: 200,
        headers: {
          "content-type": "image/png",
          "cache-control":
            "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
        },
      });
    }

    // Remote HTTP image → proxy it
    if (/^https?:\/\//i.test(imageField)) {
      const r = await fetch(imageField);
      if (!r.ok) throw new Error("fetch image failed");
      const buf = Buffer.from(await r.arrayBuffer());
      const ct = r.headers.get("content-type") || "image/png";
      return new NextResponse(buf, {
        headers: {
          "content-type": ct,
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

import { NextResponse } from "next/server";
import { ImageResponse } from "@vercel/og";
import { extractImageFromTokenUri } from "@/lib/extractImage";
import { BASEBLOCKS_ABI, BASEBLOCKS_ADDRESS } from "@/lib/baseblocksAbi";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

export const runtime = "edge";

const client = createPublicClient({
  chain: base,
  transport: http(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" });

  const tokenUri: string = await client.readContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "tokenURI",
    args: [BigInt(id)],
  });

  const image = extractImageFromTokenUri(tokenUri);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          padding: "40px",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={image}
          width={420}
          height={420}
          style={{
            borderRadius: "24px",
            boxShadow: "0 0 30px rgba(0,0,0,0.4)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", fontWeight: "700" }}>
            BaseBlox Cube #{id}
          </div>
          <div style={{ fontSize: "22px", opacity: 0.8 }}>Identity on Base</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

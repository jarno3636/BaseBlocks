// app/api/baseblox/card/[id]/route.tsx
import type { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { BASEBLOCKS_ADDRESS, BASEBLOCKS_ABI } from "@/lib/baseblocksAbi";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({
  chain: base,
  transport: http(
    process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
  ),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // don't cache across cubes

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

function decodeBytes8Symbol(sym?: `0x${string}` | string): string {
  if (!sym) return "";
  const str = sym.toString();
  if (!str.startsWith("0x")) return str;
  const hex = str.slice(2);
  let out = "";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (byte === 0) break;
    out += String.fromCharCode(byte);
  }
  return out;
}

function extractImageFromTokenUri(uri?: string | null): string | undefined {
  if (!uri) return undefined;

  if (uri.startsWith("data:application/json")) {
    try {
      const [, base64] = uri.split(",");
      if (!base64) return undefined;
      const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
      const meta = JSON.parse(jsonStr);
      if (meta && typeof meta.image === "string") {
        return meta.image as string;
      }
    } catch {
      return undefined;
    }
  }

  // If it's already an image / ipfs / https URL, just return as-is
  return uri;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const clean = String(id ?? "").replace(/[^\d]/g, "");
  const width = 1200;
  const height = 630;

  if (!clean) {
    return new ImageResponse(
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 0 0, #1d4ed8 0, #020617 50%), radial-gradient(circle at 100% 100%, #4f46e5 0, #020617 50%)",
          color: "white",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        BaseBlox cube
      </div>,
      { width, height },
    );
  }

  try {
    const tokenId = BigInt(clean);

    // Fetch cube data + age + tokenURI in parallel
    const [cubeData, ageSeconds, tokenUri] = await Promise.all([
      client.readContract({
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "getCubeData",
        args: [tokenId],
      }) as Promise<any>,
      client.readContract({
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "getAge",
        args: [tokenId],
      }) as Promise<bigint>,
      client.readContract({
        address: BASEBLOCKS_ADDRESS,
        abi: BASEBLOCKS_ABI,
        functionName: "tokenURI",
        args: [tokenId],
      }) as Promise<string>,
    ]);

    const prestigeLevel = cubeData ? Number(cubeData.prestigeLevel) : 0;
    const prestigeText = prestigeLabel(prestigeLevel);

    const ageDays = Math.floor(Number(ageSeconds ?? 0n) / 86400);
    const primarySymbol = decodeBytes8Symbol(
      cubeData?.primarySymbol as `0x${string}` | undefined,
    );

    const imageUrl = extractImageFromTokenUri(tokenUri);

    const maxStars = 5;
    const starsToShow = Math.min(prestigeLevel, maxStars);
    const extraStars = Math.max(prestigeLevel - maxStars, 0);
    const starRow = Array.from({ length: starsToShow }, (_, i) => i);

    return new ImageResponse(
      (
        <div
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 0 0, #1d4ed8 0, #020617 50%), radial-gradient(circle at 100% 100%, #4f46e5 0, #020617 50%)",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
          }}
        >
          {/* Left: actual cube art */}
          <div
            style={{
              width: 520,
              height: 520,
              borderRadius: 48,
              background:
                "linear-gradient(135deg, #1e293b 0%, #0b1120 40%, #1e293b 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 40px 80px rgba(0,0,0,0.65)",
              marginRight: 48,
              overflow: "hidden",
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`BaseBlox cube #${clean}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 340,
                  height: 340,
                  borderRadius: 64,
                  background: "linear-gradient(145deg, #8b5cf6, #6366f1)",
                  boxShadow:
                    "0 0 80px rgba(129, 140, 248, 0.75), 0 40px 60px rgba(15,23,42,0.9)",
                }}
              />
            )}
          </div>

          {/* Right: stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "white",
              maxWidth: 520,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              BaseBlox cube
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, marginTop: 8 }}>
              #{clean}
            </div>

            {!!primarySymbol && (
              <div
                style={{
                  marginTop: 20,
                  fontSize: 20,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "rgba(15,23,42,0.8)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background:
                      "radial-gradient(circle at 30% 30%, #4ade80, #16a34a)",
                  }}
                />
                <span>Primary token: {primarySymbol}</span>
              </div>
            )}

            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 16,
                fontSize: 22,
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 20,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.6)",
                  minWidth: 170,
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.7 }}>Age</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  {ageDays} days
                </div>
              </div>

              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 20,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.6)",
                  minWidth: 220,
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.7 }}>Prestige</div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>
                  {prestigeText}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 18,
                  }}
                >
                  {starRow.map((i) => (
                    <span key={i}>⭐️</span>
                  ))}
                  {extraStars > 0 && (
                    <span
                      style={{
                        fontSize: 14,
                        opacity: 0.8,
                      }}
                    >
                      +{extraStars}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 28,
                fontSize: 18,
                opacity: 0.75,
              }}
            >
              Mint an evolving onchain identity cube on Base.
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
      },
    );
  } catch (err) {
    console.error("Error generating BaseBlox card", err);

    // Fallback static card (no 500s)
    return new ImageResponse(
      (
        <div
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
            background:
              "radial-gradient(circle at 0 0, #1d4ed8 0, #020617 50%), radial-gradient(circle at 100% 100%, #4f46e5 0, #020617 50%)",
            color: "white",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            BaseBlox cube #{clean}
          </div>
          <div style={{ fontSize: 16, opacity: 0.8, maxWidth: 480, textAlign: "center" }}>
            Dynamic onchain data is temporarily unavailable, but this card is
            still castable.
          </div>
        </div>
      ),
      { width, height },
    );
  }
}

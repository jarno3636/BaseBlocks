// app/api/baseblox/card/[id]/route.tsx
import type { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const rawId = params?.id ?? "";
  const clean = String(rawId).replace(/[^\d]/g, "") || "—";

  const width = 1200;
  const height = 630;

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
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
            padding: 40,
            borderRadius: 40,
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.95))",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* Left: simple cube block */}
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: 48,
              background:
                "linear-gradient(145deg, #8b5cf6, #6366f1, #0ea5e9)",
              boxShadow:
                "0 0 80px rgba(129, 140, 248, 0.85), 0 40px 60px rgba(15,23,42,0.9)",
            }}
          />

          {/* Right: text */}
          <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              BaseBlox cube
            </div>
            <div style={{ fontSize: 52, fontWeight: 800 }}>
              #{clean}
            </div>
            <div style={{ fontSize: 18, opacity: 0.85 }}>
              One evolving identity cube per wallet on Base. Age, prestige, and
              your primary token, all etched onchain.
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 14,
                opacity: 0.8,
              }}
            >
              Mint & manage this cube in the BaseBlox mini app.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    },
  );
}

// app/og/cube/[cubeId]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

type OgProps = {
  params: { cubeId: string };
  // Next passes URL query as searchParams
  searchParams: {
    age?: string;
    prestige?: string;
    ticker?: string;
  };
};

export async function GET(req: Request, { params }: OgProps) {
  const { searchParams } = new URL(req.url);

  const cubeId = params.cubeId;
  const age = searchParams.get("age") ?? "0";
  const prestige = searchParams.get("prestige") ?? "Unprestiged";
  const ticker = searchParams.get("ticker") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 0 0, #1d4ed8 0, #020617 50%), radial-gradient(circle at 100% 100%, #4f46e5 0, #020617 50%)",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif,
        }}
      >
        {/* Left side: cube art background block */}
        <div
          style={{
            width: "520px",
            height: "520px",
            borderRadius: "48px",
            background:
              "linear-gradient(135deg, #1e293b 0%, #0b1120 40%, #1e293b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 40px 80px rgba(0,0,0,0.65)",
            marginRight: "48px",
          }}
        >
          {/* Simple cube representation – replace with fancier art if you want */}
          <div
            style={{
              width: "340px",
              height: "340px",
              borderRadius: "64px",
              background: "linear-gradient(145deg, #8b5cf6, #6366f1)",
              boxShadow:
                "0 0 80px rgba(129, 140, 248, 0.75), 0 40px 60px rgba(15,23,42,0.9)",
            }}
          />
        </div>

        {/* Right side: stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "white",
            maxWidth: "520px",
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
            #{cubeId}
          </div>

          {!!ticker && (
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
                  borderRadius: "999px",
                  background:
                    "radial-gradient(circle at 30% 30%, #4ade80, #16a34a)",
                }}
              />
              <span>Primary token: {ticker}</span>
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
              <div style={{ fontSize: 28, fontWeight: 600 }}>{age} days</div>
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
              <div style={{ fontSize: 24, fontWeight: 600 }}>{prestige}</div>
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
      width: 1200,
      height: 630,
    }
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // Global headers (apply to everything)
      {
        source: "/:path*",
        headers: [
          // ✅ Explicitly allow embedding (some servers ignore empty values)
          { key: "X-Frame-Options", value: "ALLOWALL" },

          // ✅ CSP with Farcaster + Base App as allowed parents/frames
          {
            key: "Content-Security-Policy",
            value: [
              // Core
              "default-src 'self' https: data: blob:",
              "img-src 'self' https: data: blob:",
              "media-src 'self' https: blob:",
              "font-src 'self' https: data:",
              "style-src 'self' 'unsafe-inline' https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "connect-src 'self' https: wss:",
              // ❗ Allow these apps to embed/frame you
              "frame-ancestors 'self' https://warpcast.com https://*.warpcast.com https://*.farcaster.app https://*.coinbase.com https://*.cb-w.com",
              // ❗ Allow iframes you embed (if any) from these
              "frame-src https://warpcast.com https://*.warpcast.com https://*.farcaster.app https://*.coinbase.com https://*.cb-w.com https:",
              // Workers (if you use them)
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },

      // Ensure manifest is served with correct content type (no redirects)
      {
        source: "/.well-known/farcaster.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          // Keep it cacheable but easy to roll
          { key: "Cache-Control", value: "public, max-age=300, must-revalidate" },
        ],
      },
    ];
  },

  webpack: (config) => {
    // Silence optional dependency warnings (harmless)
    config.resolve.alias = { ...(config.resolve.alias || {}), "pino-pretty": false };
    return config;
  },
};

module.exports = nextConfig;

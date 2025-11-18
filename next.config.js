/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // ❌ remove X-Frame-Options completely – it's invalid here and redundant with CSP
          // { key: "X-Frame-Options", value: "ALLOWALL" },

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

              // 👇 Allow *any* parent to embed you (so Base app + dapp sites work)
              "frame-ancestors *",

              // 👇 You can still keep this broad – you only embed https iframes anyway
              "frame-src https:",

              // Workers
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },

      {
        source: "/.well-known/farcaster.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=300, must-revalidate" },
        ],
      },
    ];
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "pino-pretty": false,
    };
    return config;
  },
};

module.exports = nextConfig;

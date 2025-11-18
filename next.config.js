/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Only keep the farcaster manifest header
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

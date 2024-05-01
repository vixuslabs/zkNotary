/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, _) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      syncWebAssembly: true,
      // asyncWebAssembly: true,
    };

    return config;
  },

  transpilePackages: ["@zknotary/contracts", "zknotary-verifier"],

  swcMinify: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer();

// module.exports = process.env.ANALYZE
//   ? withBundleAnalyzer(nextConfig)
//   : nextConfig;

const toExport = process.env.ANALYZE ? bundleAnalyzer(nextConfig) : nextConfig;

export default toExport;

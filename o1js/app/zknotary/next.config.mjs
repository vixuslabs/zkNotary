/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, _) => {
    config.module.rules.push({
      test: /\.glsl/,
      loader: "webpack-glsl-loader",
    });

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      // asyncWebAssembly: true,
      syncWebAssembly: true,
      // layers: true,
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

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // @ts-ignore - The Next.js build specifically requested this setting to fix workspace root inference
    turbopack: {
      root: '.',
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.alicdn.com' },
      { protocol: 'https', hostname: '**.1688.com' },
      { protocol: 'https', hostname: '**.alibaba.com' },
      { protocol: 'https', hostname: '**.aliexpress.com' },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "azsx6694.duckdns.org",
      },
    ],
  },
};

export default nextConfig;

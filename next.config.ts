import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://clever-ibis-869.convex.cloud" + "/**")],
  },
};

export default nextConfig;

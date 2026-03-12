import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile react-globe.gl and its dependencies for Next.js compatibility
  transpilePackages: ["react-globe.gl", "globe.gl", "three-globe"],
  // Allow loading textures from unpkg CDN
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "unpkg.com" },
    ],
  },
};

export default nextConfig;

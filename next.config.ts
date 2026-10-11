import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/GF_UNIVER",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

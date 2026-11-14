import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  allowedDevOrigins: ["*.e2b.app"],
  images: { unoptimized: true },
};

export default nextConfig;

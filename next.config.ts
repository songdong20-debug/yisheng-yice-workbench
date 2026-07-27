import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.GITHUB_ACTIONS ? "export" : undefined,
  basePath: process.env.GITHUB_ACTIONS ? "/yisheng-yice-workbench" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/yisheng-yice-workbench/" : "",
  trailingSlash: true,
};

export default nextConfig;

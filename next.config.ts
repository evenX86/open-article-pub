import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 输出模式
  output: 'standalone',

  // 实验性功能
  experimental: {
    // 启用 TypeScript 严格模式
    typedRoutes: true,
  },
};

export default nextConfig;

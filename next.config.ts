import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 添加空的 turbopack 配置以使用 webpack（因为需要支持 .txt 文件导入）
  turbopack: {},
  webpack: (config) => {
    // 配置 webpack 以支持导入 .txt 文件作为字符串
    // 使用 webpack 5 的内置 asset/source 类型，无需额外安装包
    config.module.rules.push({
      test: /\.txt$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;

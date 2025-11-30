import type { NextConfig } from "next";
import path from "node:path";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const LOADER = path.resolve(
  __dirname,
  "src/visual-edits/component-tagger-loader.js",
);

const nextConfig: NextConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi'],
    localeDetection: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: false,
    domains: ["ucarecdn.com", "firebasestorage.googleapis.com"],
  },
  // Enable compression in production
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [LOADER],
      },
    },
  },
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons', 'date-fns'],
  },
};

export default withBundleAnalyzer(nextConfig);

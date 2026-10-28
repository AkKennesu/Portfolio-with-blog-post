import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "framer-motion",
      "three",
      "three-bas",
      "gsap",
      "lenis",
      "embla-carousel-react",
      "embla-carousel-autoplay",
      "@radix-ui/react-slot",
    ],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization || {};
      const splitChunks = config.optimization.splitChunks;
      if (splitChunks && typeof splitChunks === "object") {
        splitChunks.cacheGroups = {
          ...(splitChunks.cacheGroups || {}),
          three: {
            test: /[\\/]node_modules[\\/](three|three-bas)[\\/]/,
            name: "three-vendor",
            chunks: "async",
            priority: 40,
          },
          gsap: {
            test: /[\\/]node_modules[\\/](gsap)[\\/]/,
            name: "gsap-vendor",
            chunks: "async",
            priority: 35,
          },
          embla: {
            test: /[\\/]node_modules[\\/](embla-carousel.*)[\\/]/,
            name: "embla-vendor",
            chunks: "async",
            priority: 30,
          },
        };
      }
    }
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || process.env.CDN_URL;

const nextConfig: NextConfig = {
  // Support custom CDN distribution (e.g. Cloudflare, CloudFront, BunnyCDN)
  assetPrefix: CDN_URL ? CDN_URL.replace(/\/$/, "") : undefined,
  compress: true,
  poweredByHeader: false,
  compiler: {
    // Minify JS bundle by stripping debug console logs in production
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
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
  async headers() {
    return [
      {
        // Immutable long-term caching for hashed JS chunks, CSS, and webpack manifests
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        // Static assets and fonts (with CORS headers so CDN origin loading never fails)
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=604800",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        // Next.js optimized image responses
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=604800",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.optimization = config.optimization || {};
      if (!dev) {
        config.optimization.minimize = true;
      }
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

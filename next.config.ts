import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Temporarily disable ESLint during builds to allow build to pass
  eslint: { 
    ignoreDuringBuilds: false, 
  },

  // Enable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false
  },

  // Disable automatic error page generation to avoid Pages Router conflicts
  output: 'standalone',
  
  // Disable automatic static optimization for error pages
  trailingSlash: false,
  
  // Disable automatic error page generation
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  // Handle MongoDB connection errors gracefully in production
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Specify which packages should only be loaded on the server-side
  serverExternalPackages: [
    "mongodb",
    "mongodb-client-encryption",
    "kerberos",
    "@mongodb-js/zstd",
    "@napi-rs/snappy-win32-x64-msvc",
    "snappy",
    "gcp-metadata",
    "socks",
    "bson",
  ],

  // Turbopack configuration (stable)
  turbopack: {
    rules: {
      "*.node": ["empty"],
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    resolveAlias: {
      // MongoDB dependencies that should be stubbed
      "mongodb-client-encryption": "next/dist/compiled/noop",
      kerberos: "next/dist/compiled/noop",
      "@mongodb-js/zstd": "next/dist/compiled/noop",
      snappy: "next/dist/compiled/noop",
      "gcp-metadata": "next/dist/compiled/noop",
      "socks": "next/dist/compiled/noop",
    },
  },

  // Experimental features for performance
  experimental: {
    serverMinification: true,
    optimizePackageImports: ['@heroicons/react', 'framer-motion', 'lucide-react'],
    optimizeCss: true,
    scrollRestoration: true,
    // legacyBrowsers: false, // Removed as it's not supported in current Next.js version
    // browsersListForSwc: true, // Removed as it's not supported in current Next.js version
  },

  // Configure image optimization
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "buscadis.com" },
      { protocol: "https", hostname: "www.buscadis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "cdn.buscadis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Bundle analyzer
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

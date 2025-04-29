import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Handle MongoDB connection errors gracefully in production
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Mark certain packages as external to prevent them from being bundled
  serverExternalPackages: [
    "mongodb",
    "mongodb-client-encryption",
    "kerberos",
    "@mongodb-js/zstd",
    "snappy",
    "aws4",
    "gcp-metadata",
    "socks",
    "bson",
  ],

  // Experimental features
  experimental: {
    // Configure Turbopack settings
    turbo: {
      rules: {
        "*.node": ["empty"],
      },
      resolveAlias: {
        "mongodb-client-encryption": "next/dist/compiled/noop",
        kerberos: "next/dist/compiled/noop",
        "@mongodb-js/zstd": "next/dist/compiled/noop",
        snappy: "next/dist/compiled/noop",
        aws4: "next/dist/compiled/noop",
        "gcp-metadata": "next/dist/compiled/noop",
        "socks": "next/dist/compiled/noop",
      },
    },
  },

  // Configure image remote patterns (replaces deprecated domains)
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "buscadis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "cdn.buscadis.com" },
      { protocol: "https", hostname: "buscadis-storage.s3.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },

  // Provide MongoDB URI via serverRuntimeConfig for server-side only
  serverRuntimeConfig: {
    mongodb: {
      uri: process.env.MONGODB_URI,
    },
  },

  // Add webpack config for handling MongoDB dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js modules on the client to prevent errors
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        "fs/promises": false,
        "timers/promises": false,
        path: false,
        url: false,
        http: false,
        https: false,
        zlib: false,
        stream: false,
        crypto: false,
        "util/types": false,
      };
    }

    // Configuración para manejar problemas de casing en Windows
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/components/ui/Tabs": "@/components/ui/Tabs-adapter",
    };

    return config;
  },

  // Support for framer-motion
  transpilePackages: ['framer-motion'],
};

export default nextConfig;

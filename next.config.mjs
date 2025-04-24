/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle MongoDB connection errors gracefully in production
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Mark certain packages as external to prevent them from being bundled
  experimental: {
    serverComponentsExternalPackages: [
      "mongodb",
      "mongodb-client-encryption",
      "kerberos",
      "@mongodb-js/zstd",
      "snappy",
      "aws4",
      "gcp-metadata",
      "socks",
    ],
    // Configure Turbopack settings
    turbo: {
      loaders: {
        ".node": "empty",
      },
      resolveAlias: {
        "mongodb-client-encryption": "next/dist/compiled/noop",
        kerberos: "next/dist/compiled/noop",
        "@mongodb-js/zstd": "next/dist/compiled/noop",
        snappy: "next/dist/compiled/noop",
        aws4: "next/dist/compiled/noop",
        "gcp-metadata": "next/dist/compiled/noop",
        socks: "next/dist/compiled/noop",
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
};

export default nextConfig;

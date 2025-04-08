/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only handle server-only modules on client-side
    if (!isServer) {
      // Properly mark optional MongoDB dependencies as external in client bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "mongodb-client-encryption": false,
        kerberos: false,
        "@mongodb-js/zstd": false,
        snappy: false,
        aws4: false,
        "gcp-metadata": false,
        socks: false,
        "util/types": false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
      };

      // Use null-loader for MongoDB native modules
      config.module.rules.push({
        test: /\.node$/,
        loader: "null-loader",
      });

      // Use null-loader for MongoDB and related modules
      config.module.rules.push({
        test: /mongodb\/.*\.js$|mongodb-client-encryption\/.*\.js$|kerberos\/.*\.js$|@mongodb-js\/zstd\/.*\.js$|snappy\/.*\.js$|aws4\/.*\.js$|socks\/.*\.js$|gcp-metadata\/.*\.js$/,
        loader: "null-loader",
      });
    }

    return config;
  },
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
  // Configure image domains
  images: {
    domains: [
      "localhost",
      "buscadis.com",
      "storage.googleapis.com",
      "cdn.buscadis.com",
    ],
  },
};

export default nextConfig;

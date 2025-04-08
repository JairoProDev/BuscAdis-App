/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // ⚠️ Dangerous option, only use for MVP
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Dangerous option, only use for MVP
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "buscadis-storage.s3.amazonaws.com",
      "images.unsplash.com",
      "randomuser.me",
      "res.cloudinary.com",
      "via.placeholder.com",
    ],
  },
  // Provide MongoDB URI via serverRuntimeConfig for server-side only
  serverRuntimeConfig: {
    mongodb: {
      uri: process.env.MONGODB_URI,
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only dependencies in client-side bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Node.js modules
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        util: false,
        assert: false,
        buffer: false,
        events: false,
        querystring: false,
        string_decoder: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
        "fs/promises": false,
        "timers/promises": false,
        "util/types": false,
        "node:fs": false,
        "node:path": false,

        // MongoDB-specific modules
        mongodb: false,
        mongoose: false,
        "mongodb-client-encryption": false,
        aws4: false,
        snappy: false,
        "@mongodb-js/zstd": false,
        kerberos: false,
        "@aws-sdk/credential-providers": false,
        "mongodb-connection-string-url": false,
        bson: false,
        "bson-ext": false,
        saslprep: false,
        bl: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;

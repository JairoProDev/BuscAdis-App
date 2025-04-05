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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to import these modules in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        "fs/promises": false,
        "timers/promises": false,
        mongoose: false,
        mongodb: false,
        bufferutil: false,
        "utf-8-validate": false,
      };
    }

    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
    };

    return config;
  },
  // Provide MongoDB URI via serverRuntimeConfig for server-side only
  serverRuntimeConfig: {
    mongodb: {
      uri: process.env.MONGODB_URI,
    },
  },
};

module.exports = nextConfig;

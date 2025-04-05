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
    domains: ["buscadis-storage.s3.amazonaws.com"],
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
      };
    }
    return config;
  },
};

module.exports = nextConfig;

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
};

module.exports = nextConfig;

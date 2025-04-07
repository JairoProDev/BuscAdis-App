/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only handle server-only modules on client-side
    if (!isServer) {
      // Handle binary modules and Node.js modules in browser environment
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

      // Exclude node binary modules completely from browser bundles
      config.module = {
        ...config.module,
        exprContextCritical: false,
        rules: [
          ...config.module.rules,
          {
            test: /\.node$/,
            loader: "ignore-loader",
          },
          {
            test: /node_modules[\\/](mongodb|kerberos|@mongodb-js[\\/]zstd|mongodb-client-encryption)/,
            loader: "ignore-loader",
          },
        ],
      };
    }

    return config;
  },
  images: {
    domains: [
      "localhost",
      "buscadis.com",
      "storage.googleapis.com",
      "cdn.buscadis.com",
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "mongodb",
      "mongodb-client-encryption",
      "kerberos",
    ],
    turbo: {
      // Configure Turbopack settings here
    },
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // MongoDB uses some Node.js modules that are not available in browsers
    if (!isServer) {
      // Mark MongoDB and its dependencies as server-only modules
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

      // Prevent webpack from trying to bundle server-only modules
      config.module.rules.push({
        test: /mongodb\/.*\.js$|mongodb-client-encryption\/.*\.js$|kerberos\/.*\.js$|@mongodb-js\/zstd\/.*\.js$|snappy\/.*\.js$/,
        use: "null-loader",
      });

      // Prevent webpack from trying to bundle native node modules
      config.module.rules.push({
        test: /\.node$/,
        use: "null-loader",
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
    ],
    turbo: {
      // Configure Turbopack settings here
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

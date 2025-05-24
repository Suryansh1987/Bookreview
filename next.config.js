/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com', 'example.com'],
  },

  experimental: {
    instrumentationHook: false,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@opentelemetry/api': 'commonjs @opentelemetry/api',
      });
    }
    return config;
  },
};

module.exports = nextConfig;

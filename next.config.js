/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable tracing to avoid permission issues
  experimental: {
    instrumentationHook: false,
  },
  // Alternative way to disable tracing
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@opentelemetry/api': 'commonjs @opentelemetry/api',
      })
    }
    return config
  },
}

module.exports = nextConfig
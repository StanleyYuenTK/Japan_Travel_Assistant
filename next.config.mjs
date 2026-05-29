/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: 10 * 1024 * 1024, // 10MB in bytes
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,  // 只保留必要 fallback
      path: false,
      stream: false,
      zlib: false,
    };
    return config;
  },

};
// module.exports = nextConfig;

export default nextConfig;

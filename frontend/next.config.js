/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  images: {
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Allow images from these domains
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.yourdomain.com',
        pathname: '/**',
      },
    ],
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum quality (1-100)
    minimumCacheTTL: 60,
    // Disable static image optimization in development (faster)
    unoptimized: process.env.NODE_ENV === 'development',
  },
  turbopack: {},
  // Experimental features for better code splitting
  experimental: {
    optimizePackageImports: [
      '@tanstack/react-query',
      'recharts',
      'date-fns',
      'zustand',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;


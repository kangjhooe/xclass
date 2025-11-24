const DEFAULT_API_URL = 'http://localhost:3000/api';

function getApiOrigins() {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  try {
    const parsed = new URL(rawUrl);
    const origin = `${parsed.protocol}//${parsed.host}`;
    const websocketOrigin = origin.replace(/^http/, 'ws');
    return {
      rawUrl,
      origin,
      websocketOrigin,
    };
  } catch {
    return {
      rawUrl,
      origin: DEFAULT_API_URL.replace(/\/api$/, ''),
      websocketOrigin: DEFAULT_API_URL.replace(/\/api$/, '').replace(/^http/, 'ws'),
    };
  }
}

const { rawUrl: apiUrl, origin: apiOrigin, websocketOrigin: apiWsOrigin } = getApiOrigins();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
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
      'lucide-react',
    ],
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Code splitting optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            // UI components chunk
            ui: {
              name: 'ui',
              test: /[\\/]components[\\/]ui[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com data:",
              `connect-src 'self' ${apiOrigin} ${apiWsOrigin} https://www.google-analytics.com https://www.googletagmanager.com`,
              "frame-src 'self' https://www.google.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;


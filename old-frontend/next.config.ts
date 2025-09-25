import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Clean configuration without experimental features
  experimental: {
    // Remove problematic configurations
  },

  // Configure images properly
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'localhost'],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Disable strict mode to prevent hydration issues
  reactStrictMode: false,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // SWC minification is enabled by default in Next.js 15

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Output configuration
  output: 'standalone',

  // Webpack configuration to prevent common errors
  webpack: (config, { dev, isServer }) => {
    // Prevent webpack from watching node_modules
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
    };

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.default = false;
      config.optimization.splitChunks.cacheGroups.vendors = false;
      config.optimization.splitChunks.cacheGroups.framework = {
        chunks: 'all',
        name: 'framework',
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
        priority: 40,
        enforce: true,
      };
    }

    return config;
  },

  // Headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

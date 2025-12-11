import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    dirs: ['pages', 'app', 'components', 'lib', 'src', 'convex'],
  },
  images: {
    formats: ['image/avif'],
    remotePatterns: [
      {
        hostname: 'merchkins.9aeabbfdeac1c51a434e5c4653daa252.r2.cloudflarestorage.com',
        protocol: 'https',
        pathname: '/**',
      },
      // Add wildcard pattern for R2 storage to handle dynamic bucket names
      {
        hostname: '*.r2.cloudflarestorage.com',
        protocol: 'https',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'merchkins.com' },
      { protocol: 'https', hostname: '*.merchkins.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react'],
    useLightningcss: true,
  },
};

export default nextConfig;

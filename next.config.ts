import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname:
          'merchkins.9aeabbfdeac1c51a434e5c4653daa252.r2.cloudflarestorage.com',
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
  },
}

export default nextConfig

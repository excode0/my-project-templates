import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,

  async redirects() {
    return [
      { source: '/admin-dashboard', destination: '/dashboard', permanent: false },
      { source: '/admin', destination: '/dashboard', permanent: false },
      { source: '/admin/:path*', destination: '/dashboard/:path*', permanent: false },
      { source: '/contributor-dashboard', destination: '/dashboard', permanent: false },
      { source: '/earnings', destination: '/dashboard/earnings', permanent: false },
      { source: '/users', destination: '/dashboard/users', permanent: false },
      { source: '/templates/new', destination: '/dashboard/templates/new', permanent: false },
      { source: '/templates/:id/review', destination: '/dashboard/templates/:id/review', permanent: false },
      { source: '/templates/:id/edit', destination: '/dashboard/templates/:id/edit', permanent: false },
      { source: '/templates', destination: '/dashboard/templates', permanent: false },
    ]
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Production optimizations
  compiler: {
    // Remove console logs in production (keep error/warn)
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Compression
  compress: true,
  
  // Production source maps (disable for faster builds)
  productionBrowserSourceMaps: false,

  // Experimental optimizations
  experimental: {
    // Optimize package imports (tree-shaking)
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
}

// Bundle analyzer (run with ANALYZE=true npm run build)
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config: NextConfig) => config

export default withBundleAnalyzer(nextConfig)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components (Next.js 15+)
  serverExternalPackages: ['@ai-sdk/openai', 'groq'],
  
  // Environment variables for production
  env: {
    NEXT_PUBLIC_APP_NAME: 'DoktorNaDohled',
    NEXT_PUBLIC_APP_DESCRIPTION: 'AI konverzační platforma pro české zdravotnictví',
  },
  
  // Performance optimizations for healthcare platform
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers for healthcare data
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
  
  // API routes optimizations
  async rewrites() {
    return [
      {
        source: '/zdravotnictvi/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  
  // Bundle analyzer for performance monitoring
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  
  // TypeScript strict mode for healthcare compliance
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint for code quality
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
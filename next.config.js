/** @type {import('next').NextConfig} */
const nextConfig = {
  // Seguridad: Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
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
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com; connect-src 'self' http://localhost:3001 https://*.railway.app https://*.example.com https://identitytoolkit.googleapis.com https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com https://firestore.googleapis.com https://*.gstatic.com; img-src 'self' data: https: blob:; font-src 'self' https://*.gstatic.com data:;",
          },
        ],
      },
    ];
  },

  // Optimización de imágenes
  images: {
    domains: ['cdn.example.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
      {
        protocol: 'https',
        hostname: '*.firebaseapp.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compresión
  compress: true,

  // Generación de sitemap y robots.txt
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
        {
          source: '/robots.txt',
          destination: '/api/robots',
        },
      ],
    };
  },

  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  },

  // Configuración de producción
  productionBrowserSourceMaps: false,
  swcMinify: true,

  // Experimental features
  experimental: {
    optimizePackageImports: ['@nextui-org/react'],
  },
};

module.exports = nextConfig;
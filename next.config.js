const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
  },
  // Add cache control headers
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Redirect all routes to home in production except allowed paths
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path((?!api|_next|static|favicon.ico).*)',
          destination: '/lumo',
          permanent: false,
        },
      ];
    }
    return [];
  },
};

module.exports = withBundleAnalyzer(nextConfig); 
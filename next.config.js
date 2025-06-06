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
  // Only build and allow access to the landing page
  pageExtensions: ['ts', 'tsx'],
  // Temporarily exclude all routes except landing page
  async rewrites() {
    return {
      beforeFiles: [
        // Only allow the landing page and its assets
        {
          source: '/',
          destination: '/lumo',
        },
        // Block all other routes
        {
          source: '/:path*',
          destination: '/lumo',
        },
      ],
    };
  },
  // Only include specific pages in the build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Only include the landing page in client-side builds
      config.entry = async () => {
        const entries = { 'main.js': './app/lumo/page.tsx' };
        return entries;
      };
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig); 
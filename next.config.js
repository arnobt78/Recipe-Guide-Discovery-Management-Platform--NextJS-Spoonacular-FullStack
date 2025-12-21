/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  // Image optimization
  images: {
    domains: ['spoonacular.com', 'cdn.spoonacular.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.spoonacular.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },
  // Environment variables that should be available on the client
  env: {
    // These will be available via process.env in both server and client
  },
};

module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build
  },
};

module.exports = nextConfig;

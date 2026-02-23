/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // Keep as a serverful build so API routes remain available in production
  trailingSlash: false,
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "dist",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

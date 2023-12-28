/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "dist",
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

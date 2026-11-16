/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "dist",
  output: "export",
  reactStrictMode: true,
  // yarn build runs Oxlint and Oxfmt before Next. Next 14's built-in lint
  // integration only supports ESLint, which this project no longer uses.
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

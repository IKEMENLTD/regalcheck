/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Turbopack設定（Next.js 16+で必須）
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // Netlify用の設定
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

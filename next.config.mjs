/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // canvas関連のエイリアス設定
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // externals配列を確保
    if (!config.externals) {
      config.externals = [];
    }
    if (!Array.isArray(config.externals)) {
      config.externals = [config.externals];
    }

    if (isServer) {
      // サーバーサイド: Node.js専用パッケージをexternal化
      config.externals.push('canvas');
      config.externals.push('pdf-parse');
      config.externals.push('@napi-rs/canvas');
      // pdfjs-distはバンドルする（externalにしない）
    } else {
      // クライアントサイド: pdf-parseのみブロック
      // pdfjs-distはクライアントで使われないので問題ない
      config.resolve.alias['pdf-parse'] = false;
    }

    return config;
  },
  images: {
    unoptimized: true,
  },
  // サーバーコンポーネントでのNode.js パッケージを許可（Next.js 16+）
  serverExternalPackages: ['pdf-parse', 'canvas', '@napi-rs/canvas'],
};

export default nextConfig;

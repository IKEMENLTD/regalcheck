/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // canvas を external に追加
    config.externals = config.externals || [];
    if (!Array.isArray(config.externals)) {
      config.externals = [config.externals];
    }
    config.externals.push('canvas');

    // pdf-parseをサーバーサイドのみで処理
    if (isServer) {
      config.externals.push('pdf-parse');
      config.externals.push('@napi-rs/canvas');
      config.externals.push('pdfjs-dist');
    } else {
      // クライアントサイドでは完全にブロック
      config.resolve.alias['pdf-parse'] = false;
    }

    return config;
  },
  // Netlify用の設定
  images: {
    unoptimized: true,
  },
  // サーバーコンポーネントでのNode.js パッケージを許可（Next.js 16+）
  serverExternalPackages: ['pdf-parse', 'canvas', '@napi-rs/canvas', 'pdfjs-dist'],
};

export default nextConfig;

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
      // pdfjs-distはバンドルする（externalにしない）
    } else {
      // クライアントサイドでは完全にブロック
      config.resolve.alias['pdf-parse'] = false;
      config.resolve.alias['pdfjs-dist'] = false;
    }

    return config;
  },
  // Netlify用の設定
  images: {
    unoptimized: true,
  },
  // サーバーコンポーネントでのNode.js パッケージを許可（Next.js 16+）
  // pdfjs-distはバンドルするのでserverExternalPackagesから除外
  serverExternalPackages: ['pdf-parse', 'canvas', '@napi-rs/canvas'],
};

export default nextConfig;

# 契約書リスクチェッカー - Claude Code 開発ガイド

## プロジェクト概要

Google Gemini APIを使用した契約書の法的リスク自動分析ツール。

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **AI API**: Google Gemini 1.5 Flash（無料）
- **スタイリング**: Tailwind CSS v4
- **PDF解析**: pdf-parse（純粋なNode.jsライブラリ）
- **デプロイ**: Netlify対応

---

## 主要な技術的課題と解決策

### 1. PDF解析エラー（DOMMatrix is not defined）

**問題**:
- pdfjs-distはブラウザ向けのライブラリ
- サーバーサイド（Node.js）にDOMMatrix, Path2D, CanvasGradientなどが存在しない
- Next.js 16のTurbopackでもエラーが発生

**解決策**:
```typescript
// lib/pdfPolyfill.ts を作成
// サーバーサイドに存在しないブラウザAPIのモック実装
- DOMMatrix（2D行列演算）
- Path2D（SVGパス）
- CanvasGradient（グラデーション）
- CanvasPattern（パターン塗りつぶし）
```

**実装ポイント**:
1. `lib/pdfPolyfill.ts`で`globalThis`にポリフィルを追加
2. `lib/fileParser.ts`の最初に`import './pdfPolyfill'`
3. `pdfjsLib.GlobalWorkerOptions.workerSrc = ''`でWorkerを無効化

### 2. PDF Workerエラー

**問題**:
```
Cannot find module 'pdf.worker.mjs'
```

**解決策**:
```typescript
// Workerを完全に無効化
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

// ドキュメント読み込み時の設定
pdfjsLib.getDocument({
  data: uint8Array,
  useWorkerFetch: false,    // Workerなし
  isEvalSupported: false,   // eval使用禁止
  disableAutoFetch: false,
  disableStream: false,
});
```

### 3. Tailwind CSS v4の設定

**問題**:
- v4では`@tailwind`ディレクティブが非推奨
- ブレークポイント設定方法が変更

**解決策**:
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --breakpoint-xs: 275px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1440px;
}
```

### 4. レート制限（セキュリティ対策）

**実装内容**:
- IPアドレスベースで1日5回まで
- メモリベースのストア（`lib/rateLimit.ts`）
- 429エラーでリセット時刻を返す

**本番環境での改善案**:
- Redisに移行（複数サーバー対応）
- Vercel KVやNetlify Blobsの利用

---

## ディレクトリ構造

```
契約書リスクチェッカー001/
├── app/
│   ├── api/analyze/route.ts    # API endpoint
│   ├── page.tsx                # メインUI
│   ├── layout.tsx
│   └── globals.css             # Tailwind v4設定
├── components/
│   ├── FileUploader.tsx        # ファイルアップロード
│   ├── RiskCard.tsx            # リスク表示カード
│   └── RiskReport.tsx          # 分析結果表示
├── lib/
│   ├── geminiClient.ts         # Gemini API連携
│   ├── fileParser.ts           # PDF/DOCX/TXT解析
│   ├── pdfPolyfill.ts          # DOMMatrix等のポリフィル
│   ├── rateLimit.ts            # レート制限
│   └── types.ts                # 型定義
├── .env.local                  # API キー（Git管理外）
├── next.config.mjs             # Next.js設定
└── netlify.toml                # Netlify設定
```

---

## 環境変数

```.env
# Google AI Studio API Key
GOOGLE_API_KEY=your_api_key_here
```

**取得方法**:
https://aistudio.google.com/app/apikey

---

## 重要な設定ファイル

### next.config.mjs

```javascript
const nextConfig = {
  output: 'standalone',
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    config.externals = config.externals || [];
    if (!Array.isArray(config.externals)) {
      config.externals = [config.externals];
    }
    config.externals.push('canvas');
    return config;
  },
  serverExternalPackages: ['pdfjs-dist', 'canvas'],
};
```

**重要ポイント**:
- `serverExternalPackages`: pdfjs-distをサーバー専用パッケージとして扱う
- `canvas`のaliasをfalseに（ブラウザ用canvasの読み込みを防ぐ）

---

## デバッグ方法

### ログの確認

**サーバーログ**（ターミナル）:
```
📝 API /analyze called
🔒 Client IP: 127.0.0.1
✅ Rate limit check passed. Remaining: 4
🔄 Converting base64 to buffer...
✅ Buffer created, size: 12345 bytes
📖 Parsing file...
🔍 Starting PDF parsing with pdfjs-dist...
✅ DOMMatrix polyfill installed
📦 pdfjs-dist loaded
🔧 Buffer converted to Uint8Array, size: 12345
📝 PDF loading task created
📄 PDF loaded: 3 pages
📖 Starting text extraction from 3 pages...
  📄 Processing page 1/3...
  ✅ Page 1 extracted: 567 chars
✅ PDF parsed successfully, total text length: 1234
🤖 Starting Gemini analysis...
```

**ブラウザコンソール**:
- F12で開発者ツールを開く
- Consoleタブでエラーを確認

---

## トラブルシューティング

### エラー: DOMMatrix is not defined

**原因**: ポリフィルが読み込まれていない

**解決策**:
1. `lib/fileParser.ts`の先頭に`import './pdfPolyfill'`があるか確認
2. サーバーを再起動: `npm run dev`

### エラー: Cannot find module 'pdf.worker.mjs'

**原因**: Workerが有効になっている

**解決策**:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '';
```

### エラー: Rate limit exceeded

**原因**: 1日5回の制限を超えた

**解決策**:
- 24時間待つ
- 開発中は`lib/rateLimit.ts`の`limit`を増やす

---

## Netlifyデプロイ

### 必要な環境変数

Netlify管理画面で設定:
```
GOOGLE_API_KEY=your_actual_api_key
```

### デプロイコマンド

```bash
# ビルドテスト
npm run build

# Netlify CLIでデプロイ
netlify deploy --prod
```

---

## パフォーマンス最適化

### 現在の実装

- ファイルサイズ上限: 50MB
- テキスト長上限: 50,000文字
- レート制限: 5回/日/IP
- Gemini 1.5 Flash使用（無料・高速）

### 改善案

1. **キャッシング**: 同じファイルの再分析を避ける
2. **ストリーミング**: 大きなPDFを分割処理
3. **Redis**: レート制限をRedisに移行
4. **OCR対応**: 画像PDFのテキスト抽出

---

## 既知の制限事項

1. **画像PDFは非対応**: テキストレイヤーが必要
2. **複雑なレイアウト**: 表や図は正確に抽出できない場合あり
3. **メモリベースのレート制限**: サーバー再起動でリセット

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番環境実行
npm start

# 型チェック
npm run type-check

# リント
npm run lint
```

---

## API仕様

### POST /api/analyze

**Request**:
```json
{
  "fileData": "base64_encoded_file",
  "fileName": "contract.pdf",
  "fileType": "application/pdf"
}
```

**Response (成功)**:
```json
{
  "success": true,
  "data": {
    "score": 85,
    "risks": [
      {
        "category": "損害賠償",
        "level": "high",
        "title": "損害賠償の上限が設定されていない",
        "description": "...",
        "quote": "...",
        "suggestion": "..."
      }
    ],
    "summary": "..."
  }
}
```

**Response (エラー)**:
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

---

## 貢献・修正時の注意点

1. **ポリフィルの順序**: `pdfPolyfill.ts`は必ず最初にインポート
2. **ログの追加**: console.log()で絵文字付きログを推奨
3. **エラーハンドリング**: try-catchで詳細なエラーメッセージを
4. **型安全性**: TypeScriptの型を活用
5. **レスポンシブ**: xs（275px）からの対応を忘れずに

---

## ライセンス・免責事項

本サービスは法的助言を提供するものではありません。
重要な契約は必ず弁護士等の専門家に相談してください。

---

## 更新履歴

- 2025-11-10: 初版作成、Gemini API対応、DOMMatrixポリフィル実装

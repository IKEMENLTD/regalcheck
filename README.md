# 契約書リスクチェッカー

AIで契約書の落とし穴を発見する無料Webサービス

## 機能

- PDF, DOCX, TXTファイルのアップロード対応
- Claude AIによる契約書の自動リスク分析
- 10項目の法的リスクチェック
- リスクレベルの可視化（高/中/低）
- 改善提案の表示
- 完全レスポンシブデザイン（275px〜1440px対応）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Claude APIキーを設定してください：

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

APIキーは [Anthropic Console](https://console.anthropic.com/) で取得できます。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

1. 契約書ファイル（PDF, DOCX, TXT）をアップロード
2. AIが自動で契約書を分析（約10秒）
3. 検出されたリスクと改善提案を確認

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **AI**: Anthropic Claude API
- **ファイル解析**: pdf-parse, mammoth

## プロジェクト構成

```
契約書リスクチェッカー001/
├── app/
│   ├── page.tsx              # メインページ
│   ├── layout.tsx            # レイアウト
│   ├── globals.css           # グローバルCSS
│   └── api/
│       └── analyze/
│           └── route.ts      # 分析APIエンドポイント
├── components/
│   ├── FileUploader.tsx      # ファイルアップロード
│   ├── RiskCard.tsx          # リスクカード
│   └── RiskReport.tsx        # 結果表示
├── lib/
│   ├── types.ts              # 型定義
│   ├── fileParser.ts         # ファイル解析
│   └── claudeClient.ts       # Claude API連携
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## レスポンシブ対応

- **xs**: 275px〜
- **sm**: 640px〜
- **md**: 768px〜
- **lg**: 1024px〜
- **xl**: 1280px〜
- **2xl**: 1440px

すべてのコンテンツ、文字サイズ、余白が各ブレークポイントで最適化されています。

## デプロイ

### Netlifyへのデプロイ

詳細な手順は [DEPLOY.md](./DEPLOY.md) を参照してください。

**簡単な手順:**
1. GitHubにリポジトリを作成してプッシュ
2. Netlifyアカウントでリポジトリをインポート
3. 環境変数 `ANTHROPIC_API_KEY` を設定
4. 自動でビルド＆デプロイ完了

## ライセンス

MIT

## 免責事項

本サービスは契約書の一般的なリスクを参考情報として提供するものであり、法的助言や弁護士によるレビューに代わるものではありません。重要な契約については必ず弁護士等の専門家にご相談ください。

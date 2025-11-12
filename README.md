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

`.env.example` をコピーして `.env.local` ファイルを作成し、Google Gemini APIキーを設定してください：

```bash
cp .env.example .env.local
```

`.env.local` を編集：

```bash
GOOGLE_API_KEY=your_actual_google_api_key_here
```

**APIキーの取得方法:**
- Google Gemini API: [Google AI Studio](https://aistudio.google.com/app/apikey)

**⚠️ セキュリティ警告:**
- `.env.local` ファイルは絶対にGitにコミットしないでください（.gitignoreで除外済み）
- 本番環境ではVercelの環境変数設定を使用してください
- 定期的にAPIキーをローテーションしてください

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

- **フロントエンド**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **バックエンド**: Next.js API Routes
- **AI**: Google Gemini 2.0 Flash
- **ファイル解析**: unpdf (PDF), mammoth (DOCX)
- **セキュリティ**: Rate Limiting (5回/日/IP), ファイル自動削除

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
2. Vercelアカウントでリポジトリをインポート
3. 環境変数 `GOOGLE_API_KEY` を設定
4. 自動でビルド＆デプロイ完了

**⚠️ 重要:** 本番環境にデプロイする前に、必ずセキュリティ脆弱性を修正してください

## ライセンス

MIT

## 免責事項

本サービスは契約書の一般的なリスクを参考情報として提供するものであり、法的助言や弁護士によるレビューに代わるものではありません。重要な契約については必ず弁護士等の専門家にご相談ください。

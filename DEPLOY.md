# Netlifyへのデプロイ手順

## 前提条件

- Netlifyアカウント（無料で作成可能）
- Claude API キー（https://console.anthropic.com/ で取得）
- Gitリポジトリ（GitHubなど）

## デプロイ手順

### 1. Gitリポジトリにプッシュ

```bash
cd "/mnt/c/Users/ooxmi/Downloads/契約書リスクチェッカー001"

# Gitリポジトリの初期化（まだの場合）
git init

# すべてのファイルを追加
git add .

# コミット
git commit -m "Initial commit: 契約書リスクチェッカー"

# GitHubリポジトリと連携（リポジトリを作成後）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Netlifyでサイトを作成

1. https://app.netlify.com/ にログイン
2. 「Add new site」→「Import an existing project」をクリック
3. GitHub/GitLabを選択して連携
4. リポジトリを選択

### 3. ビルド設定

Netlifyが自動的に `netlify.toml` を検出しますが、以下を確認してください：

**Build settings:**
- Build command: `npm run build`
- Publish directory: `.next`
- Base directory: （空欄でOK）

### 4. 環境変数の設定

「Site settings」→「Environment variables」で以下を追加：

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | あなたのClaude APIキー |
| `NODE_VERSION` | `20` |

### 5. デプロイ

「Deploy site」をクリックすると、自動的にビルドとデプロイが開始されます。

完了すると、以下のようなURLでアクセス可能になります：
```
https://YOUR_SITE_NAME.netlify.app
```

## 重要な注意事項

### ✅ Netlify用に最適化済みの設定

このプロジェクトには以下の設定が含まれています：

1. **netlify.toml**
   - ビルドコマンドとプラグインの設定
   - Next.js 最適化プラグイン

2. **next.config.mjs**
   - `output: 'standalone'` でビルド最適化
   - `images.unoptimized: true` で画像最適化を無効化

3. **package.json**
   - Node.jsバージョン指定
   - Netlifyプラグインの自動インストール

### 🔒 セキュリティ

- `.env.local` はGitにコミットされません（`.gitignore`に含まれています）
- APIキーはNetlify管理画面から設定してください

### 📊 モニタリング

Netlifyダッシュボードで以下を確認できます：
- デプロイ状況
- ビルドログ
- エラーログ
- アクセス統計

## トラブルシューティング

### ビルドエラーが発生する場合

1. **Node.jsバージョンの確認**
   ```
   環境変数で NODE_VERSION=20 が設定されているか確認
   ```

2. **依存関係のエラー**
   ```
   netlify.toml に --legacy-peer-deps フラグが設定されているか確認
   ```

3. **Claude APIキーの確認**
   ```
   環境変数 ANTHROPIC_API_KEY が正しく設定されているか確認
   ```

### デプロイ後にエラーが発生する場合

1. **関数タイムアウト**
   - Netlifyの無料プランは関数実行時間が10秒まで
   - 契約書の分析が長い場合、Pro以上のプランが必要

2. **APIレート制限**
   - Claude APIのレート制限に注意
   - 頻繁にアクセスされる場合は、キャッシュの実装を検討

## カスタムドメインの設定

Netlifyダッシュボードから独自ドメインを設定できます：

1. 「Domain settings」→「Add custom domain」
2. ドメインを入力
3. DNSレコードを設定（Netlify DNSまたは外部DNS）
4. SSL証明書は自動的に発行されます（Let's Encrypt）

## 継続的デプロイ

Gitリポジトリにプッシュするたびに、Netlifyが自動的に：
1. 最新のコードを取得
2. ビルドを実行
3. デプロイを実行

変更を反映させる場合：
```bash
git add .
git commit -m "Update: 機能改善"
git push
```

## コスト

### Netlify
- **無料プラン**:
  - 100GB/月の帯域幅
  - 300分/月のビルド時間
  - 基本的な機能で十分

### Claude API
- **従量課金**:
  - Claude 3.5 Sonnet: 入力 $3/百万トークン、出力 $15/百万トークン
  - 1契約書あたり約0.01〜0.05ドル程度

---

**デプロイ完了後のURL例:**
```
https://contract-risk-checker.netlify.app
```

何か問題が発生した場合は、Netlifyのサポートドキュメントを参照してください：
https://docs.netlify.com/

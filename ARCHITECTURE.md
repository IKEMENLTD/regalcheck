# 契約書リスクチェッカー - システム設計書

**リバースエンジニアリング視点でのアーキテクチャ分析**

作成日: 2025年1月  
バージョン: 0.1.1 (セキュリティ強化版)

---

## 📋 目次

1. [システム概要](#システム概要)
2. [アーキテクチャ全体像](#アーキテクチャ全体像)
3. [主要コンポーネント詳細](#主要コンポーネント詳細)
4. [データフロー](#データフロー)
5. [セキュリティ設計](#セキュリティ設計)
6. [技術スタック詳細](#技術スタック詳細)
7. [デプロイメント構成](#デプロイメント構成)
8. [制約事項と設計判断](#制約事項と設計判断)

---

## システム概要

### 目的
契約書ファイル（PDF/DOCX/TXT）をAIで自動分析し、法的リスクを10項目で可視化する無料Webサービス。

### 主要機能
- ファイルアップロード（PDF, DOCX, TXT対応）
- サーバーレス環境でのPDF/DOCXテキスト抽出
- Google Gemini 2.0 Flashによる契約書リスク分析
- 10項目のリスク評価（高/中/低）
- レスポンシブUI（275px〜1440px対応）
- レート制限（5回/日/IP）
- ファイル自動削除（最大60秒保持）

### 非機能要件
- **パフォーマンス**: 分析時間 < 15秒
- **可用性**: Vercelサーバーレス環境で99.9%稼働
- **セキュリティ**: API Keyの暗号化、レート制限、ファイル検証
- **スケーラビリティ**: サーバーレスアーキテクチャで自動スケール

---

## アーキテクチャ全体像

```
[クライアント側]                [サーバー側]                [外部サービス]
┌─────────────┐               ┌─────────────┐             ┌──────────────┐
│ Next.js App │               │ API Routes  │             │ Google       │
│ (React 19)  │───HTTP POST───│ /analyze    │────API──────│ Gemini 2.0   │
│             │               │  (Node.js)  │             │ Flash        │
└─────────────┘               └─────────────┘             └──────────────┘
      │                             │
      │                       ┌─────▼─────┐
      │                       │ Rate      │
      │                       │ Limiter   │
      │                       └───────────┘
      │                       ┌───────────┐
      └────localStorage───────│ Disclaimer│
                              │ Modal     │
                              └───────────┘
```

### レイヤー構造

1. **プレゼンテーション層** (app/page.tsx, components/*)
   - ユーザーインターフェース
   - ファイルアップロード
   - 結果表示

2. **APIエンドポイント層** (app/api/analyze/route.ts)
   - リクエスト検証
   - レート制限
   - エラーハンドリング

3. **ビジネスロジック層** (lib/*)
   - ファイルパース
   - AI分析
   - セキュリティチェック

4. **外部連携層**
   - Gemini API連携
   - PDF/DOCX処理

---

## 主要コンポーネント詳細

### 1. ファイルアップロード (app/page.tsx)

**責務:**
- ファイルの選択とバリデーション
- Base64エンコード
- APIリクエスト送信
- 結果表示

**処理フロー:**
1. ユーザーがファイルを選択
2. クライアント側で形式チェック（PDF/DOCX/TXT）
3. FileReaderでBase64エンコード
4. POST `/api/analyze` にJSON送信
5. レスポンスを待機（ローディング表示）
6. 結果を画面に表示

**制約:**
- ファイルサイズ: 最大10MB（サーバー側で検証）
- 対応形式: PDF, DOCX, TXT のみ

---

### 2. 免責事項モーダル (components/DisclaimerModal.tsx)

**責務:**
- 初回訪問時の利用規約表示
- バージョン管理された規約の同意追跡
- アクセシビリティ対応

**データ保存:**
```typescript
localStorage.setItem('terms-version', '1.0.0');
localStorage.setItem('terms-agreed', 'true');
localStorage.setItem('terms-timestamp', '2025-01-20T10:30:00.000Z');
```

**セキュリティ機能:**
- バージョン管理（規約更新時に再同意要求）
- タイムスタンプ記録（監査証跡）
- Escキーで拒否（誤クリック防止）
- フォーカストラップ（キーボードナビゲーション）

---

### 3. APIエンドポイント (app/api/analyze/route.ts)

**責務:**
- リクエスト検証
- レート制限チェック
- ファイルパース
- AI分析実行
- セキュリティヘッダー付与

**セキュリティ対策:**

#### 3.1 レート制限
```
IP識別 → カウント確認 → 制限判定
   ↓           ↓            ↓
フィンガープリント  5回/24h    429エラー
```

#### 3.2 入力サニタイゼーション
```typescript
// HTMLタグ除去
fileName = fileName.replace(/<[^>]+>/g, '');
```

#### 3.3 セキュリティヘッダー
```typescript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; ..."
}
```

---

### 4. ファイルパーサー (app/api/analyze/fileParser.ts)

**責務:**
- ファイルタイプ検証（マジックナンバー）
- PDF/DOCX/TXTテキスト抽出
- サイズ制限チェック

**マジックナンバー検証:**

| 形式  | マジックナンバー | 検証方法 |
|-------|------------------|----------|
| PDF   | `%PDF-` (0x25 0x50 0x44 0x46) | 先頭4バイト照合 |
| DOCX  | `PK` (0x50 0x4B) + `[Content_Types].xml` | ZIP+内部構造確認 |
| TXT   | UTF-8 BOM or ASCII範囲 | 文字コード範囲チェック |

**処理フロー:**
```
Buffer受信 → サイズチェック → マジックナンバー検証 → テキスト抽出
   (10MB制限)     (空ファイル拒否)    (偽装防止)      (unpdf/mammoth)
```

**PDF処理の特殊性:**
- **unpdf**: サーバーレス最適化PDF.js
- Worker不要（Vercel/Lambda対応）
- Buffer → Uint8Array変換が必要
- `{mergePages: true}` でページ結合

---

### 5. レート制限 (lib/rateLimit.ts)

**責務:**
- IP/フィンガープリント識別
- アクセス頻度管理
- 古いエントリの自動削除

**IP識別の優先順位:**

1. **Vercel専用ヘッダー** (最高信頼度)
   - `x-vercel-forwarded-for`
   - `x-real-ip`

2. **Cloudflare** (CDN経由)
   - `cf-connecting-ip`

3. **標準ヘッダー** (偽装リスクあり)
   - `x-forwarded-for` → 最初のIPのみ使用

4. **フィンガープリント** (フォールバック)
   ```typescript
   hash(User-Agent + Accept-Language + Accept-Encoding + ...)
   ```

**IP検証:**
```typescript
// IPv4: xxx.xxx.xxx.xxx (0-255範囲)
/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// IPv6: 完全形 + 圧縮形対応
/^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i
```

**プライベートIP対策:**
```typescript
if (ip.startsWith('192.168.') || ip.startsWith('10.') || ...) {
  return `${ip}-${fingerprint}`; // IP+フィンガープリント併用
}
```

**ストレージ構造:**
```typescript
{
  "203.0.113.42": {
    count: 3,
    resetTime: 1737504000000  // 24時間後のUnixタイム
  }
}
```

---

### 6. AI分析エンジン (lib/geminiClient.ts)

**責務:**
- Gemini APIとの通信
- プロンプト構築
- レスポンスパース

**プロンプト構造:**
```
[システムロール]
あなたは契約書の法的リスクを分析する専門家です。

[指示]
以下の契約書を10項目で評価してください:
1. 契約期間・解除条件
2. 支払い条件
3. 責任・賠償範囲
...

[契約書本文]
{fileContent}

[出力形式]
JSON形式で返却
```

**モデル選択理由:**
- **Gemini 2.0 Flash**: 高速・低コスト・日本語対応
- **Claude Sonnet**: (将来の拡張用)
- **xAI Grok**: (将来の拡張用)

**エラーハンドリング:**
```typescript
try {
  const result = await model.generateContent(prompt);
} catch (error) {
  // エラーメッセージを簡略化（内部詳細を隠す）
  throw new Error('AI分析に失敗しました');
}
```

---

## データフロー

### 通常フロー (成功時)

```
1. ユーザーがファイル選択
   ↓
2. クライアント側バリデーション (形式チェック)
   ↓
3. Base64エンコード
   ↓
4. POST /api/analyze
   {
     fileData: "JVBERi0xLjQK...",  // Base64
     fileName: "契約書.pdf",
     fileType: "application/pdf"
   }
   ↓
5. サーバー側処理:
   a. IP識別 → レート制限チェック
   b. 入力サニタイゼーション (fileName)
   c. Base64 → Buffer変換
   d. マジックナンバー検証
   e. サイズチェック (0B < size ≤ 10MB)
   f. テキスト抽出 (unpdf/mammoth)
   g. 文字数検証 (100〜50,000文字)
   h. Gemini API呼び出し
   i. レスポンス整形
   ↓
6. クライアントに返却
   {
     success: true,
     data: {
       score: 65,
       risks: [...],
       recommendations: [...]
     }
   }
   ↓
7. UI更新（リスクカード表示）
```

### エラーフロー

```
エラー発生時
   ↓
ログ記録 (サーバー側のみ)
   [ERROR] Parse failed: ...
   ↓
クライアントには一般的なメッセージ
   {
     success: false,
     error: "ファイルの解析に失敗しました"
   }
   ↓
UI: エラーメッセージ表示
```

**エラー種別:**

| エラー | HTTPステータス | クライアントメッセージ |
|--------|----------------|------------------------|
| レート制限超過 | 429 | "1日の利用上限に達しました" |
| ファイル形式不正 | 400 | "ファイルデータが不正です" |
| ファイルサイズ超過 | 400 | "ファイルサイズが大きすぎます（最大10MB）" |
| マジックナンバー不一致 | 400 | "ファイル形式が一致しません" |
| AI分析失敗 | 500 | "分析中にエラーが発生しました" |

---

## セキュリティ設計

### 脅威モデル

#### 1. API Keyの露出 (Critical - 修正済み)
**脅威:** GitHubにAPIキーがコミットされると、第三者が無制限に使用可能

**対策:**
- `.env.local` を `.gitignore` に追加
- `.env.example` テンプレート提供
- Vercel環境変数使用（本番環境）
- README.mdに警告記載

#### 2. レート制限バイパス (Critical - 修正済み)
**脅威:** `X-Forwarded-For` ヘッダー偽装で無制限アクセス

**対策:**
- IP検証（IPv4/IPv6正規表現）
- フィンガープリント生成（User-Agent等のハッシュ）
- プライベートIP検出
- Vercel/Cloudflare専用ヘッダー優先

#### 3. ファイルタイプ偽装 (Critical - 修正済み)
**脅威:** 拡張子を変更したマルウェアのアップロード

**対策:**
- マジックナンバー検証（ファイル先頭バイト）
- サーバー側でMIMEタイプ再検証
- サイズ制限（10MB）
- 許可リスト方式（PDF/DOCX/TXTのみ）

#### 4. XSS攻撃 (High - 修正済み)
**脅威:** ファイル名にスクリプトタグを挿入

**対策:**
- 入力サニタイゼーション
  ```typescript
  fileName.replace(/<script[^>]*>.*?<\/script>/gi, '')
           .replace(/<[^>]+>/g, '')
  ```
- CSPヘッダー
  ```
  script-src 'self'; style-src 'self' 'unsafe-inline';
  ```

#### 5. CSRF攻撃 (High - 対策済み)
**脅威:** 外部サイトから不正リクエスト

**対策:**
- Next.js組み込みCSRF保護
- `X-Frame-Options: DENY` (iframe埋め込み防止)
- `Referrer-Policy: strict-origin-when-cross-origin`

#### 6. 情報漏洩 (Medium - 修正済み)
**脅威:** エラーメッセージから内部構造が露呈

**対策:**
- エラーメッセージ簡略化
  ```typescript
  // ❌ NG: parseError.message をそのまま返す
  // ✅ OK: "ファイルの解析に失敗しました"
  ```
- ログは `[INFO]`/`[ERROR]` プレフィックス
- IPアドレスは部分マスキング（ログ表示時）

---

### セキュリティヘッダー一覧

```typescript
{
  'X-Content-Type-Options': 'nosniff',           // MIMEタイプスニッフィング防止
  'X-Frame-Options': 'DENY',                     // クリックジャッキング防止
  'X-XSS-Protection': '1; mode=block',           // XSS保護
  'Referrer-Policy': 'strict-origin-when-cross-origin',  // リファラー制限
  'Content-Security-Policy': "default-src 'self'; ..."   // CSP
}
```

---

## 技術スタック詳細

### フロントエンド

```typescript
{
  "next": "^16.0.1",           // React framework (App Router)
  "react": "^19.2.0",          // UIライブラリ
  "react-dom": "^19.2.0",      // DOM操作
  "tailwindcss": "^4.1.17",    // CSSフレームワーク
  "typescript": "^5.9.3"       // 型安全性
}
```

**選定理由:**
- **Next.js 16**: サーバーレス対応、API Routes、SSR
- **React 19**: 最新機能（並行レンダリング）
- **Tailwind CSS 4**: 高速ビルド、Atomic CSS

### バックエンド (API Routes)

```typescript
{
  "@google/generative-ai": "^0.24.1",  // Gemini API
  "mammoth": "^1.11.0",                // DOCX解析
  "unpdf": "^1.4.0"                    // PDF解析（サーバーレス最適化）
}
```

**PDF処理ライブラリの選択:**

| ライブラリ | メリット | デメリット | 採用 |
|------------|----------|------------|------|
| pdfjs-dist | 機能豊富 | Workerが必要、サーバーレス不可 | ❌ |
| pdf-parse  | シンプル | Canvasネイティブ依存 | ❌ |
| **unpdf**  | サーバーレス対応、Worker不要 | 比較的新しい | ✅ |

**unpdf の利点:**
- PDF.jsのサーバーレス再配布版
- Vercel/Lambda/Cloudflare Workers対応
- Worker不要（GlobalWorkerOptions設定不要）
- Buffer → Uint8Array変換のみで動作

---

### 環境変数

```bash
# .env.local (ローカル開発用)
GOOGLE_API_KEY=AIzaSy...

# Vercel環境変数 (本番環境)
GOOGLE_API_KEY=<秘密鍵>
```

---

## デプロイメント構成

### Vercel サーバーレス環境

```
[Vercel CDN]
    ↓
[Edge Network]  ← 静的ファイル配信
    ↓
[Serverless Functions]
    ├─ API Routes (/api/analyze)
    │   ├─ Node.js Runtime
    │   ├─ 10秒タイムアウト (無料プラン)
    │   └─ メモリ: 1024MB
    └─ Next.js SSR
```

### ビルド設定 (next.config.mjs)

```javascript
{
  output: 'standalone',              // サーバーレス最適化
  runtime: 'nodejs',                 // unpdf用Node.js必須
  serverExternalPackages: [
    'unpdf',                         // PDF処理
    'mammoth'                        // DOCX処理
  ],
  webpack: {
    externals: ['canvas'],           // Canvasをバンドルしない
    alias: {
      'canvas': false,
      'encoding': false
    }
  }
}
```

### 本番環境要件

1. **Node.js**: v18.0.0以上
2. **npm**: v9.0.0以上
3. **Vercel環境変数**: `GOOGLE_API_KEY` 設定
4. **ビルドコマンド**: `npm run build`
5. **起動コマンド**: `npm start`

---

## 制約事項と設計判断

### 制約事項

#### 1. Vercel無料プランの制限
- **実行時間**: 10秒 (AI分析が長引くとタイムアウト)
- **メモリ**: 1024MB
- **ファイルサイズ**: デプロイパッケージ50MB

**対策:**
- Gemini Flash（高速モデル）選択
- ファイルサイズ10MB制限
- テキスト50,000文字制限

#### 2. サーバーレス環境の特性
- **永続化不可**: ファイルシステムへの書き込み不可
- **メモリストア**: レート制限データは揮発性
- **Worker非対応**: pdfjs-dist使用不可

**対策:**
- インメモリレート制限（再起動でリセット）
- unpdfライブラリ採用
- 将来的にRedis導入検討

#### 3. PDF解析の限界
- **スキャン画像PDF**: OCR未対応
- **暗号化PDF**: パスワード保護非対応
- **複雑なレイアウト**: テキスト抽出精度低下

**ユーザーへの案内:**
```
"PDFからテキストを抽出できませんでした。
スキャンされた画像PDFの可能性があります。"
```

### 設計判断の根拠

#### 判断1: Gemini 2.0 Flash選択
**理由:**
- GPT-4より20倍高速
- 日本語対応
- 無料枠が大きい（60req/min）
- コスト効率が高い

#### 判断2: localStorage使用 (免責事項同意)
**理由:**
- サーバーレスで永続化不要
- プライバシー配慮（サーバー保存なし）
- 規約バージョン管理可能

**欠点と対策:**
- ブラウザクリアで消える → 初回訪問時の再表示は許容
- クロスデバイス同期不可 → 単一デバイス利用が前提

#### 判断3: メモリベースレート制限
**理由:**
- 実装が簡単
- Vercel無料プランで動作
- サーバー再起動で自動クリーンアップ

**欠点と将来改善:**
- 再起動でリセット → Redis導入で永続化
- マルチインスタンスで不整合 → 現状は問題なし（小規模）

---

## まとめ

本システムは、**サーバーレスアーキテクチャ**と**AI駆動型分析**を組み合わせた、セキュアで高速な契約書リスクチェッカーです。

### 主要な技術的成果

1. **サーバーレス最適化**
   - unpdfによるWorker不要PDF解析
   - Vercel環境での安定動作

2. **多層防御セキュリティ**
   - マジックナンバー検証
   - IP偽装対策（フィンガープリント）
   - 入力サニタイゼーション
   - セキュリティヘッダー

3. **ユーザーエクスペリエンス**
   - レスポンシブデザイン（275px〜）
   - アクセシビリティ対応（ARIA）
   - 明確なエラーメッセージ

### 今後の改善案

1. **パフォーマンス**
   - ストリーミングレスポンス（SSE）
   - キャッシング戦略

2. **セキュリティ**
   - Redis導入（レート制限永続化）
   - CAPTCHA追加（ボット対策）

3. **機能拡張**
   - OCR対応（スキャンPDF）
   - 複数ファイル一括分析
   - 分析履歴保存（オプトイン）

---

**作成者**: Claude Sonnet 4.5  
**最終更新**: 2025年1月  
**ライセンス**: MIT

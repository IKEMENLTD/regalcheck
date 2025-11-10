import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '契約書リスクチェッカー - AIで契約書の落とし穴を発見',
  description: '契約書の一般的な法的リスクを自動検出し、利用者に警告を提供する無料Webサービス',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}

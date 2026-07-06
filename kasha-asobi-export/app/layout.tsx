import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'カシャカシャあそび',
  description:
    '赤ちゃんが大好きな「カシャカシャ音」をその場で合成する多感覚あそびアプリ。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

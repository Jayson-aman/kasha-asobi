import type { Metadata } from 'next';
import KashaApp from './KashaApp';

export const metadata: Metadata = {
  title: 'カシャカシャ あそび | 赤ちゃんの多感覚あそびアプリ（多言語対応）',
  description:
    '赤ちゃんが大好きな「カシャカシャ音」をその場で合成。タッチすると音・光・形が反応する多感覚あそびアプリ。胎内音モードは無料。プレミアムで音パック・録音再生・タイマー・きせかえも。英語・中国語・韓国語ほか多言語対応。月齢別おもちゃガイド付き。',
  // iPhone で「ホーム画面に追加」するとアプリのように起動できます
  appleWebApp: {
    capable: true,
    title: 'カシャカシャ',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/images/kasha-icon-192.png',
    apple: '/apple-icon.png',
  },
};

export default function KashaKashaPage() {
  return <KashaApp />;
}

import type { NextConfig } from 'next';

// MOBILE_EXPORT=1 のときだけ静的書き出し（out/）に切り替え、Capacitor で
// ネイティブアプリに同梱できるようにします。通常の web ビルドには影響しません。
const mobile = process.env.MOBILE_EXPORT === '1';

const config: NextConfig = mobile
  ? {
      output: 'export',
      images: { unoptimized: true },
    }
  : {};

export default config;

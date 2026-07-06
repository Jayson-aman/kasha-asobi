import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor 設定：この web アプリをネイティブ iOS / Android アプリに包みます。
// webDir は `npm run build:mobile`（MOBILE_EXPORT=1 next build）で生成される out/。
//
// アプリを「カシャカシャあそび」から起動したい場合は、ネイティブ側の起動 URL を
// index.html ではなく kashakasha/index.html に向けるか、
// out/index.html をカシャカシャへリダイレクトするようにしてください。
const config: CapacitorConfig = {
  appId: 'group.zaibase.kashakasha',
  appName: 'カシャカシャあそび',
  webDir: 'out',
  ios: {
    contentInset: 'always',
  },
  // 開発中は下の server を有効にすると、ビルドせずに実機で確認できます。
  // server: { url: 'http://192.168.0.10:3000', cleartext: true },
};

export default config;

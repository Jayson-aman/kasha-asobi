# ネイティブアプリ化（iOS / Android）— Capacitor 土台

この web アプリ（Next.js）を **Capacitor** でネイティブアプリに包むための土台です。
「カシャカシャあそび」を App Store / Google Play に出す、iOS のアプリ内サブスク
（IAP）を実装する、といった発展につながります。

> ⚠️ **iOS のビルド・申請には Mac（Xcode）と Apple Developer Program（年 $99）が
> 必須**です。この土台までは用意済みですが、実機ビルドと申請は Mac 上で行います。

---

## 何が入っているか

- `@capacitor/core` / `cli` / `ios` / `android`（devDependencies）
- `capacitor.config.ts` … appId・appName・webDir(`out`) の設定
- `next.config.ts` … `MOBILE_EXPORT=1` のときだけ静的書き出し（`out/`）に切替。
  通常の web ビルドには影響しません。
- npm scripts:
  - `npm run build:mobile` … 静的書き出し（`out/` を生成）
  - `npm run cap:sync` … 書き出し＋`cap sync`
  - `npm run cap:ios` … 書き出し＋同期＋Xcode を開く（要 Mac）
  - `npm run cap:android` … 書き出し＋同期＋Android Studio を開く

## セットアップ手順（Mac 推奨）

```bash
# 1) 依存インストール
npm install

# 2) 静的書き出し（out/ が生成される）
npm run build:mobile

# 3) ネイティブ platform を追加（初回のみ。ios は Mac 必須）
npx cap add ios
npx cap add android

# 4) web の変更を反映
npm run cap:sync

# 5) IDE で開いてビルド／実機実行
npx cap open ios       # Xcode
npx cap open android   # Android Studio
```

`ios/` `android/` フォルダは各自の環境で生成されるため `.gitignore` 済みです。

## 起動画面を「カシャカシャあそび」にする

静的書き出しはサイト全体（`out/index.html` がトップ）を含みます。アプリを
カシャカシャから開きたい場合は、いずれか：

- ネイティブの起動 URL を `kashakasha.html` に向ける、または
- `out/index.html` をカシャカシャへリダイレクトするビルド後処理を足す。

## アプリ内課金（IAP）の土台 — RevenueCat

ティア制（スタンダード/プロ/マックス）を iOS/Android のアプリ内課金につなぐ
土台を実装済みです。

- `@revenuecat/purchases-capacitor` を devDependencies に追加。
- `app/kashakasha/iap.ts` … web では何もせず（Stripe リンクにフォールバック）、
  ネイティブでのみ RevenueCat 経由で購入・復元・エンタイトルメント→ティア変換を行う
  薄いラッパー（native のときだけ動的 import するため web ビルド/SSR に影響なし）。
- `app/kashakasha/config.ts` の `REVENUECAT` / `RC_ENTITLEMENT_TIER` / `PLAN_PRODUCT`
  を実際の設定に合わせて編集します。
- アプリ側の挙動：
  - 起動時、ネイティブなら購入状態からティアを自動反映。
  - 料金プランのボタンは、ネイティブなら IAP 購入、web なら Stripe リンク。
  - 「🔁 購入を復元」ボタンをネイティブでのみ表示（App Store 必須要件）。

### セットアップ手順

1. **App Store Connect / Google Play** でサブスク商品を登録
   （例: `kasha_standard_monthly`, `kasha_standard_yearly`, `kasha_pro_monthly`,
   `kasha_max_monthly`）。`config.ts` の `PLAN_PRODUCT` を合わせる。
2. **RevenueCat** でプロジェクトを作成し、エンタイトルメント
   `standard` / `pro` / `max` を商品に紐付け（`RC_ENTITLEMENT_TIER` と対応）。
3. RevenueCat の iOS 公開APIキーを環境変数 `NEXT_PUBLIC_RC_IOS_KEY` に設定。
4. `npm run cap:ios` でビルド → 実機/サンドボックスでサブスクをテスト。

> IAP のAPIメソッド名は RevenueCat のバージョンで変わることがあります。
> `iap.ts` は v8 を想定。差異があれば `purchaseStoreProduct` などを調整してください。

## iOS のサブスク（アプリ内課金 / IAP）について

- Apple のガイドライン上、**iOS アプリ内のデジタル課金は Apple の IAP（StoreKit）
  必須**で、Stripe やクレジットカードを直接使うことはできません（手数料 15〜30%）。
- 実装には Capacitor 用の IAP プラグイン（例: `@capacitor-community/in-app-purchases`
  や RevenueCat の `@revenuecat/purchases-capacitor`）を追加し、App Store Connect で
  サブスク商品を登録します。
- 現状の web 版は Stripe（クレジットカード・Apple Pay・Google Pay）でサブスク可能です。
  **web はカード決済、iOS ネイティブは IAP** という住み分けになります。

## 補足

- Web 配信は従来どおり `npm run build` / Vercel で変わりません。
- 開発中に実機で素早く確認したいときは、`capacitor.config.ts` の `server.url` を
  開発マシンの LAN IP（`http://192.168.x.x:3000`）に設定すると、書き出し不要で
  ホットリロードできます（本番前に必ず戻してください）。

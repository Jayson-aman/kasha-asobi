# 課金・翻訳キーの設定ガイド

実際に課金・翻訳を動かすために必要なキーの取得先と設定方法です。
**秘密キーはこのリポジトリや第三者に共有しないでください。** 値は `.env.local`
（Git 管理外）か、ホスティングの環境変数に設定します。

```bash
cp .env.example .env.local   # 雛形をコピーして値を記入
```

## 1. Stripe（Web の決済 — クレジットカード）

1. https://dashboard.stripe.com/ にログイン（無料）。
2. 「商品」で各プランを作成（月額¥380 / 年額¥3,800 / プロ¥780 / マックス¥1,280 など）。
   サブスクは「継続」、買い切りは「1回限り」。
3. 各商品で **Payment Link** を発行。
4. 各リンクの詳細 →「支払い後」→「リダイレクト」を次に設定：
   - スタンダード（月/年）→ `https://<このアプリのドメイン>/kashakasha?tier=1`
   - プロ → `?tier=2` ／ マックス → `?tier=3`
5. 発行された `https://buy.stripe.com/...` を `.env.local` の
   `NEXT_PUBLIC_STRIPE_MONTHLY` などに貼り付け。
6. 入金：Stripe 残高 → 銀行口座へ自動振込（本人確認と口座登録が必要）。

> テストは Stripe の「テストモード」で。カード番号 `4242 4242 4242 4242` などが使えます。

## 2. RevenueCat（iOS/Android アプリ内課金）

1. https://www.revenuecat.com/ でプロジェクト作成（月次売上 $2,500 まで無料）。
2. App Store Connect / Google Play で **サブスク商品**を登録
   （商品ID例：`kasha_standard_monthly` … `app/kashakasha/config.ts` の
   `PLAN_PRODUCT` と一致させる）。
3. RevenueCat で **エンタイトルメント** `standard` / `pro` / `max` を作り、商品を紐付け
   （`RC_ENTITLEMENT_TIER` と対応）。
4. RevenueCat → API keys の **Public (Apple)** キー（`appl_...`）を
   `.env.local` の `NEXT_PUBLIC_RC_IOS_KEY` に設定。
5. 詳細な iOS ビルド手順は `MOBILE.md` を参照。

> iOS のデジタル課金は Apple の IAP 必須（Stripe/カード直決済は不可）。
> Web は Stripe、iOS ネイティブは IAP、という住み分けです。

## 3. Anthropic（全言語への自動翻訳）

1. https://console.anthropic.com/ で API キーを発行（`sk-ant-...`）。
2. `.env.local` の `ANTHROPIC_API_KEY` に設定。
3. 実行：`npm run i18n:translate`（詳細は `TRANSLATE.md`）。
   これはビルド/スクリプト時のみ使用し、ブラウザには露出しません。

## 本番（Vercel など）への設定

`.env.local` の各値を、ホスティングの Environment Variables に登録します。
`NEXT_PUBLIC_` 付きは全環境、`ANTHROPIC_API_KEY` はビルド環境に設定してください。

---

### 未設定でも動く？

はい。未設定でもアプリは動作します（決済リンクはテスト用ダミー、翻訳は既存の
手動＋生成分のみ、IAP はネイティブでのみ有効）。キーを入れると本番の課金・翻訳が
有効になります。

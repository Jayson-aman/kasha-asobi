// カシャカシャあそび：課金まわりの設定
//
// 段階的に開放される「ティア制」課金。
//   0 = 無料 / 1 = スタンダード(月額・年額) / 2 = プロ / 3 = マックス
// 上位ほど多くの機能が開放されます。
//
// 決済はすべて Stripe が処理（クレジットカード・Apple Pay・Google Pay 対応）。
//
// ▼ 決済後にティアを自動解放するには：
//   各 Payment Link の「支払い後のリダイレクト先」を、ティアに応じて
//     https://<このアプリのドメイン>/kashakasha?tier=1   （月額・年額）
//     https://<このアプリのドメイン>/kashakasha?tier=2   （プロ）
//     https://<このアプリのドメイン>/kashakasha?tier=3   （マックス）
//   に設定してください。戻ってきたときに自動で解放されます。

const env = (k: string) =>
  (typeof process !== 'undefined' && process.env[k]) || '';

// ティア定義
export const TIER = { FREE: 0, STANDARD: 1, PRO: 2, MAX: 3 } as const;

// プラン → 解放ティア
export const PLAN_TIER: Record<string, number> = {
  monthly: TIER.STANDARD,
  yearly: TIER.STANDARD,
  pro: TIER.PRO,
  max: TIER.MAX,
};

// 各プランの決済リンク（環境変数で上書き可）。
// business（法人・保育園向け）の連絡先は、このアプリ専用の連絡先メールに変更してください。
export const CHECKOUT: Record<string, string> = {
  monthly: env('NEXT_PUBLIC_STRIPE_MONTHLY') || 'https://buy.stripe.com/test_monthly',
  yearly: env('NEXT_PUBLIC_STRIPE_YEARLY') || 'https://buy.stripe.com/test_yearly',
  pro: env('NEXT_PUBLIC_STRIPE_PRO') || 'https://buy.stripe.com/test_pro',
  max: env('NEXT_PUBLIC_STRIPE_MAX') || 'https://buy.stripe.com/test_max',
  tip: env('NEXT_PUBLIC_STRIPE_TIP') || 'https://buy.stripe.com/test_tip',
  gift: env('NEXT_PUBLIC_STRIPE_GIFT') || 'https://buy.stripe.com/test_gift',
  business: env('NEXT_PUBLIC_STRIPE_BUSINESS') || 'mailto:hello@example.com',
};

// アプリ内 CTA（バナー）の主誘導先＝スタンダード月額
export const STRIPE_CHECKOUT_URL =
  env('NEXT_PUBLIC_STRIPE_KASHA_URL') || CHECKOUT.monthly;

// アプリ内バナーの表示価格（言語非依存。詳細な価格は料金プランに表示）
export const PREMIUM_PRICE = '¥380〜';

// localStorage キー（到達ティアを数値で保存）
export const TIER_STORAGE_KEY = 'kasha_tier_v1';
export const PREMIUM_STORAGE_KEY = 'kasha_premium_v1'; // 旧・後方互換
export const LANG_STORAGE_KEY = 'kasha_lang_v1';

// --- ネイティブ（iOS/Android）アプリ内課金：RevenueCat ---
// RevenueCat の公開APIキー（iOS）。native ビルドの環境変数で設定します。
export const REVENUECAT = {
  apiKey: env('NEXT_PUBLIC_RC_IOS_KEY') || '',
};

// RevenueCat の「エンタイトルメント識別子」→ ティア。
// RevenueCat ダッシュボードで standard/pro/max のエンタイトルメントを作成してください。
export const RC_ENTITLEMENT_TIER: Record<string, number> = {
  standard: TIER.STANDARD,
  pro: TIER.PRO,
  max: TIER.MAX,
};

// プランID → App Store Connect / Google Play の商品ID。
// 実際に登録する商品IDに合わせて変更してください。
export const PLAN_PRODUCT: Record<string, string> = {
  monthly: 'kasha_standard_monthly',
  yearly: 'kasha_standard_yearly',
  pro: 'kasha_pro_monthly',
  max: 'kasha_max_monthly',
};

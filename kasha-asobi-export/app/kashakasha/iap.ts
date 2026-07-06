// カシャカシャあそび：アプリ内課金（IAP）の薄いラッパー
//
// - Web では何もしません（isNative()=false）。Stripe リンクにフォールバック。
// - ネイティブ（Capacitor iOS/Android）では RevenueCat 経由で StoreKit / Google Play を扱います。
//   RevenueCat のダッシュボードで商品・エンタイトルメントを設定し、
//   下記の PLAN_PRODUCT / RC_ENTITLEMENT_TIER を App Store Connect の商品IDに合わせてください。
//
// RevenueCat プラグインは native のときだけ動的 import するため、web ビルド/SSR に影響しません。

import { Capacitor } from '@capacitor/core';
import { REVENUECAT, RC_ENTITLEMENT_TIER, PLAN_PRODUCT } from './config';

export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

let configured = false;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function rc(): Promise<any> {
  const mod: any = await import('@revenuecat/purchases-capacitor');
  return mod.Purchases;
}

async function ensure(): Promise<any | null> {
  if (!isNative() || !REVENUECAT.apiKey) return null;
  const Purchases = await rc();
  if (!configured) {
    await Purchases.configure({ apiKey: REVENUECAT.apiKey });
    configured = true;
  }
  return Purchases;
}

function entTier(customerInfo: any): number {
  const active = customerInfo?.entitlements?.active ?? {};
  let tier = 0;
  for (const id of Object.keys(active)) {
    const t = RC_ENTITLEMENT_TIER[id] ?? 0;
    if (t > tier) tier = t;
  }
  return tier;
}

/** 現在の購入状態から到達ティアを取得（native のみ。web は 0）。 */
export async function tierFromStore(): Promise<number> {
  try {
    const Purchases = await ensure();
    if (!Purchases) return 0;
    const { customerInfo } = await Purchases.getCustomerInfo();
    return entTier(customerInfo);
  } catch {
    return 0;
  }
}

/** プランを購入し、到達ティアを返す（native のみ）。 */
export async function purchasePlan(planId: string): Promise<number> {
  const Purchases = await ensure();
  if (!Purchases) return 0;
  const productId = PLAN_PRODUCT[planId];
  if (!productId) throw new Error(`unknown plan: ${planId}`);
  const res = await Purchases.getProducts({ productIdentifiers: [productId] });
  const product = res?.products?.[0];
  if (!product) throw new Error(`product not found: ${productId}`);
  const { customerInfo } = await Purchases.purchaseStoreProduct({ product });
  return entTier(customerInfo);
}

/** 購入の復元（App Store 必須要件）。到達ティアを返す。 */
export async function restorePurchases(): Promise<number> {
  const Purchases = await ensure();
  if (!Purchases) return 0;
  const { customerInfo } = await Purchases.restorePurchases();
  return entTier(customerInfo);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

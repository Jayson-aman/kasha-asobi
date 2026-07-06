'use client';

import { useEffect, useState } from 'react';
import KashaPlay from './KashaPlay';
import {
  LANG_STORAGE_KEY,
  STRIPE_CHECKOUT_URL,
  CHECKOUT,
  TIER_STORAGE_KEY,
} from './config';
import { LANGS, DEFAULT_LANG, getStrings, detectLang, isRtl } from './i18n';
import { isNative, purchasePlan } from './iap';

const AGE_COLORS = [
  { color: '#FF6B9D', bg: '#FFF1F6' },
  { color: '#4ECDC4', bg: '#E8FBF6' },
  { color: '#9B6BFF', bg: '#F1EEFF' },
];

export default function KashaApp() {
  const [lang, setLang] = useState<string>(DEFAULT_LANG);

  // 初回：保存済み or ブラウザ言語
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      /* noop */
    }
    setLang(saved && LANGS.some((l) => l.code === saved) ? saved : detectLang());
  }, []);

  const changeLang = (code: string) => {
    setLang(code);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, code);
    } catch {
      /* noop */
    }
  };

  const t = getStrings(lang);
  const rtl = isRtl(lang);

  // ネイティブ（iOS/Android）ではIAPで購入、web ではStripeリンクへ
  const buyPlan = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    planId: string,
  ) => {
    if (!isNative()) return; // web: そのままリンク遷移
    e.preventDefault();
    try {
      const tier = await purchasePlan(planId);
      if (tier > 0) {
        window.localStorage.setItem(TIER_STORAGE_KEY, String(tier));
        window.location.reload();
      }
    } catch {
      /* キャンセル等 */
    }
  };

  return (
    <main
      dir={rtl ? 'rtl' : 'ltr'}
      className="bg-gradient-to-b from-[#FFF8FB] to-white"
    >
      {/* 言語スイッチャー */}
      <div className="flex justify-center bg-white/60 px-6 py-3" dir="ltr">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500">
          🌐 {t.langLabel}
          <select
            value={lang}
            onChange={(e) => changeLang(e.target.value)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-[#1B2A5C] outline-none"
            aria-label={t.langLabel}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ヒーロー */}
      <section className="px-6 pt-10 pb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/kasha-icon.svg"
          alt=""
          width={92}
          height={92}
          className="mx-auto mb-4 h-[92px] w-[92px] rounded-[22px] shadow-lg"
        />
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#FF6B9D]">
          {t.heroBadge}
        </p>
        <h1 className="text-3xl font-black text-[#1B2A5C] md:text-4xl">
          {t.heroTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500 md:text-base">
          {t.heroSub}
        </p>
      </section>

      {/* あそび場 */}
      <section className="pb-4">
        <KashaPlay t={t} />
      </section>

      {/* あそび方 */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-center text-xl font-black text-[#1B2A5C]">
            {t.howToTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {t.howTo.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-pink-100 bg-white p-5 text-center shadow-sm"
              >
                <div className="mb-2 text-3xl">{h.icon}</div>
                <p className="font-black text-[#1B2A5C]">{h.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* なぜ夢中になるの？ */}
      <section className="bg-[#FFF8FB] px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-black text-[#1B2A5C]">
            {t.reasonsTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-gray-500">
            {t.reasonsLead}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.reasons.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-3xl">{r.icon}</span>
                  <div>
                    <span className="inline-block rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold text-[#FF6B9D]">
                      {r.tag}
                    </span>
                    <h3 className="font-black text-[#1B2A5C]">{r.title}</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* あそばせ方のコツ ＋ 発達のうれしい効果 */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-black text-[#1B2A5C]">
            {t.tipsTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-gray-500">
            {t.tipsLead}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.tips.map((tip) => (
              <div
                key={tip.title}
                className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-2 text-2xl">{tip.icon}</div>
                <p className="font-black text-[#1B2A5C]">{tip.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#FFF1F6] to-[#EEF3FF] p-6">
            <p className="mb-3 text-center font-black text-[#1B2A5C]">
              💛 {t.benefitsTitle}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {t.benefits.map((bnf) => (
                <div
                  key={bnf}
                  className="flex items-start gap-2 rounded-xl bg-white/70 px-4 py-2.5 text-sm text-gray-700"
                >
                  <span className="text-[#FF6B9D]">✔</span>
                  {bnf}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 料金プラン：段階的に開放されるティア制 */}
      <section className="bg-[#FFFBF3] px-6 py-14">
        <div data-shot="plans" className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-black text-[#1B2A5C]">
            {t.plansTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-gray-500">
            {t.plansLead}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* 無料 */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t.tierNames[0]}
              </p>
              <p className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black text-[#1B2A5C]">
                  {t.freeName}
                </span>
                <span className="text-[11px] text-gray-400">{t.freeSub}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {t.freeFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px] text-gray-600"
                  >
                    <span className="text-[#4ECDC4]">✔</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-full bg-gray-100 px-4 py-2.5 text-center text-sm font-black text-gray-500">
                {t.freeCta}
              </div>
            </div>

            {/* 各プラン（月額・年額・プロ・マックス）*/}
            {t.plans.map((plan) => {
              const href = CHECKOUT[plan.id] ?? STRIPE_CHECKOUT_URL;
              const isMail = href.startsWith('mailto:');
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                    plan.highlight
                      ? 'border-2 border-[#C9A050] shadow-md'
                      : 'border-gray-200'
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#C9A050] px-3 py-0.5 text-[10px] font-black text-white shadow">
                      {t.recommended}
                    </span>
                  )}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9A050]">
                    {t.tierNames[plan.tier]}
                  </p>
                  <p className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#1B2A5C]">
                      {plan.price}
                    </span>
                    <span className="text-[11px] text-gray-400">{plan.note}</span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {plan.unlocks.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-[13px] text-gray-700"
                      >
                        <span className="text-[#C9A050]">🔓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={href}
                    onClick={(e) => buyPlan(e, plan.id)}
                    target={isMail ? undefined : '_blank'}
                    rel={isMail ? undefined : 'noopener noreferrer'}
                    className={`mt-4 block rounded-full px-4 py-2.5 text-center text-sm font-black transition-colors ${
                      plan.highlight
                        ? 'bg-[#C9A050] text-white hover:bg-[#B8903F]'
                        : 'bg-gray-100 text-[#1B2A5C] hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[11px] font-semibold text-gray-500">
            {t.tierIncludesNote}
          </p>

          {/* そのほかの購入方法 */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {t.extras.map((ex) => {
              const href = CHECKOUT[ex.id] ?? STRIPE_CHECKOUT_URL;
              const isMail = href.startsWith('mailto:');
              return (
                <a
                  key={ex.id}
                  href={href}
                  target={isMail ? undefined : '_blank'}
                  rel={isMail ? undefined : 'noopener noreferrer'}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#1B2A5C] shadow-sm transition-colors hover:bg-gray-50"
                >
                  {ex.name} · {ex.price} <span className="text-gray-400">›</span>
                </a>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-white/70 p-4 text-center">
            <p className="text-[11px] leading-relaxed text-gray-500">{t.cardNote}</p>
            <p className="text-[11px] leading-relaxed text-gray-500">{t.iosNote}</p>
            <p className="text-[11px] leading-relaxed text-gray-400">
              {t.storageNote}
            </p>
          </div>
        </div>
      </section>

      {/* 月齢別ガイド */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-black text-[#1B2A5C]">
            {t.ageTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-gray-500">
            {t.ageLead}
          </p>

          <div className="mt-8 space-y-6">
            {t.ageGuide.map((g, i) => {
              const c = AGE_COLORS[i % AGE_COLORS.length];
              return (
                <div
                  key={g.age}
                  className="overflow-hidden rounded-2xl border shadow-sm"
                  style={{ borderColor: `${c.color}33` }}
                >
                  <div
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-4"
                    style={{ backgroundColor: c.bg }}
                  >
                    <span
                      className="text-2xl font-black"
                      style={{ color: c.color }}
                    >
                      {g.age}
                    </span>
                    <span className="text-sm font-bold text-[#1B2A5C]">
                      {g.stage}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      — {g.theme}
                    </span>
                  </div>
                  <div className="bg-white px-6 py-5">
                    <p className="mb-4 text-sm leading-relaxed text-gray-600">
                      {g.intro}
                    </p>
                    <div className="space-y-3">
                      {g.toys.map((toy) => (
                        <div key={toy.name} className="flex gap-3">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <div>
                            <p className="text-sm font-black text-[#1B2A5C]">
                              {toy.name}
                            </p>
                            <p className="text-xs leading-relaxed text-gray-500">
                              {toy.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-[11px] text-gray-400">{t.ageNote}</p>
        </div>
      </section>

      {/* 安全上の注意 */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-6">
          <p className="mb-2 flex items-center gap-2 font-bold text-amber-800">
            {t.safetyTitle}
          </p>
          <ul className="space-y-1.5 text-sm leading-relaxed text-amber-700">
            {t.safety.map((s, i) => (
              <li key={i}>・{s}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

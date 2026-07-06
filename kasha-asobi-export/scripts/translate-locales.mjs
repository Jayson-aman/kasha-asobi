#!/usr/bin/env node
/**
 * カシャカシャあそび：多言語ロケールの自動生成
 * ------------------------------------------------------------
 * 英語の元データ（app/kashakasha/en.json）を翻訳APIで各言語に翻訳し、
 * app/kashakasha/generated-locales.json にまとめて書き出します。
 * アプリ側（i18n.ts）はこの JSON を読み込んで言語スイッチャーに反映します。
 *
 * 使い方:
 *   ANTHROPIC_API_KEY=sk-... node scripts/translate-locales.mjs           # 既定の全言語
 *   ANTHROPIC_API_KEY=sk-... node scripts/translate-locales.mjs ko es fr  # 指定言語のみ
 *   ... node scripts/translate-locales.mjs --force ko                     # 既存でも再生成
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY   必須（Anthropic の API キー）
 *   TRANSLATE_MODEL     任意（既定 claude-haiku-4-5-20251001／高品質なら claude-sonnet-5）
 *
 * 他社API（DeepL / Google / OpenAI）を使う場合は translate() を差し替えてください。
 * JSON の「値」だけを翻訳し、キー・{placeholders}・絵文字はそのまま保持します。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'app/kashakasha/en.json');
const OUT = join(ROOT, 'app/kashakasha/generated-locales.json');

// 手動翻訳済み（i18n.ts の CHROME）。既定では自動生成の対象外にします。
const CURATED = new Set([
  'ja', 'en', 'zh-Hans', 'zh-Hant', 'ko', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'hi', 'id',
]);

// 既定のターゲット言語（i18n.ts の LANG_NAMES と対応）。
const DEFAULT_TARGETS = [
  'it', 'bn', 'pa', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'vi', 'th', 'tr', 'fa',
  'pl', 'uk', 'nl', 'ro', 'el', 'cs', 'hu', 'sv', 'da', 'fi', 'nb', 'he', 'sw', 'ha',
  'yo', 'ig', 'am', 'zu', 'af', 'ms', 'fil', 'my', 'km', 'lo', 'si', 'ne', 'bg', 'sr',
  'hr', 'sk', 'sl', 'lt', 'lv', 'et', 'ka', 'hy', 'az', 'kk', 'uz', 'mn', 'is', 'ga',
  'sq', 'mk', 'ca', 'eu', 'gl', 'cy',
];

const MODEL = process.env.TRANSLATE_MODEL || 'claude-haiku-4-5-20251001';
const API_KEY = process.env.ANTHROPIC_API_KEY;

const args = process.argv.slice(2);
const force = args.includes('--force');
const targets = args.filter((a) => !a.startsWith('--'));
const langs = (targets.length ? targets : DEFAULT_TARGETS).filter(
  (c) => !CURATED.has(c),
);

const source = JSON.parse(readFileSync(SRC, 'utf8'));
const existing = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return {};
  }
})();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(lang, obj) {
  const system =
    'You are a professional app localizer for a baby/toddler play app. ' +
    'Translate the JSON VALUES from English into the target language. ' +
    'Rules: (1) Keep all JSON keys unchanged. (2) Keep placeholders like {n}, {m}, {price} EXACTLY. ' +
    '(3) Keep emojis and symbols (♪, ¥, ✔, ●, ✨, 🔒, etc.). (4) Keep a warm, simple, child-friendly tone. ' +
    '(5) Do NOT translate machine identifiers: keep the VALUES of any "id" field verbatim ' +
    '(e.g. "monthly", "pro", "max", "bell", "kasha"), and keep booleans/numbers such as ' +
    '"tier" and "highlight" unchanged. Only translate human-readable text. ' +
    '(6) Return ONLY valid JSON with the SAME structure — no prose, no code fences.';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system,
      messages: [
        {
          role: 'user',
          content: `Target language (BCP-47): ${lang}\n\nTranslate this JSON:\n${JSON.stringify(obj)}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  let text = (data.content?.[0]?.text || '').trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const parsed = JSON.parse(text);
  return sanitize(parsed, obj);
}

// 翻訳結果の構造フィールド（id/tier/highlight）を元データから復元し、
// 決済リンクやティア判定が壊れないようにする。
function sanitize(out, src) {
  const fixArr = (o, s) => {
    if (!Array.isArray(o) || !Array.isArray(s)) return s;
    return o.map((item, i) => {
      const base = s[i] || {};
      const fixed = { ...item, id: base.id };
      if (base.tier !== undefined) fixed.tier = base.tier;
      if (base.highlight !== undefined) fixed.highlight = base.highlight;
      return fixed;
    });
  };
  if (out.plans) out.plans = fixArr(out.plans, src.plans);
  if (out.extras) out.extras = fixArr(out.extras, src.extras);
  return out;
}

async function main() {
  if (!API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY が未設定です。');
    process.exit(1);
  }
  console.log(`Model: ${MODEL}`);
  console.log(`対象: ${langs.length} 言語 ${force ? '(--force)' : '(未生成のみ)'}\n`);

  let done = 0;
  for (const lang of langs) {
    if (existing[lang] && !force) {
      console.log(`⏭️  ${lang} (既存・スキップ)`);
      continue;
    }
    try {
      const out = await translate(lang, source);
      existing[lang] = out;
      // 逐次保存（途中で止まっても成果は残る）
      writeFileSync(OUT, JSON.stringify(existing, null, 2) + '\n');
      done++;
      console.log(`✅ ${lang}`);
      await sleep(400);
    } catch (e) {
      console.error(`⚠️  ${lang}: ${e.message}`);
      await sleep(1000);
    }
  }
  console.log(`\n完了：${done} 言語を生成しました → app/kashakasha/generated-locales.json`);
}

main();

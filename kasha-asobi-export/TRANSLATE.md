# 多言語（i18n）と 全言語への自動翻訳

「カシャカシャあそび」の多言語対応の仕組みと、全言語へ広げる手順です。

## 仕組み

- **元データ**：`app/kashakasha/en.json`（英語）が唯一の基準。
- **日本語**：`app/kashakasha/i18n.ts` の `ja` に手動翻訳（全文）。
- **主要言語（手動）**：`i18n.ts` の `CHROME` に画面まわりを手動翻訳
  （中国語簡体/繁体・韓国語・スペイン語・フランス語・ドイツ語・
  ポルトガル語・ロシア語・アラビア語・ヒンディー語・インドネシア語）。
- **その他すべて（自動）**：`app/kashakasha/generated-locales.json` に
  翻訳APIで生成した各言語を格納。空 `{}` でも動作します。

言語スイッチャー（`LANGS`）は「手動 ＋ 自動生成」を自動的にマージして表示します。
`getStrings()` は該当言語が無ければ英語にフォールバックするため、常に安全です。

## 全言語へ自動翻訳する

Anthropic の API キーがあれば、英語の元データから各言語を自動生成できます。

```bash
# 既定のターゲット言語をまとめて生成（未生成のみ）
ANTHROPIC_API_KEY=sk-ant-... npm run i18n:translate

# 言語を指定して生成
ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-locales.mjs ko es fr

# 既存でも作り直す
ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-locales.mjs --force vi th

# 品質重視のモデルに変更
ANTHROPIC_API_KEY=sk-ant-... TRANSLATE_MODEL=claude-sonnet-5 npm run i18n:translate
```

- キー・`{n}`/`{price}` などのプレースホルダ・絵文字は保持されます。
- 逐次保存するので、途中で止めても生成済みぶんは残ります。
- 生成後は `generated-locales.json` をコミットすれば配信に反映されます。

### 対応言語を増やす

1. `app/kashakasha/i18n.ts` の `LANG_NAMES` に「コード → 現地語表記」を追加。
2. `scripts/translate-locales.mjs` の `DEFAULT_TARGETS` に同じコードを追加
   （または実行時に引数で指定）。
3. 翻訳スクリプトを実行。

### 他社の翻訳APIを使う

`scripts/translate-locales.mjs` の `translate()` を差し替えれば、
DeepL / Google Cloud Translation / OpenAI などにも対応できます。
JSON の「値」だけを翻訳し、キー・プレースホルダ・絵文字を保持する点だけ守ってください。

---

## App Store / Google Play の「アプリ紹介」の言語について

アプリ内の多言語（上記）と、ストアの「紹介文（タイトル・説明・スクショ）」は**別管理**です。

- **iOS（App Store Connect）**：「App 情報 → ローカリゼーション」で言語ごとに
  タイトル・サブタイトル・説明・キーワード・スクリーンショットを登録します。
  まず**主要言語（英語・日本語など）から**始め、対応国を広げるのが定石です。
  英語（U.S.）を用意しておくと、未対応地域はそれが既定表示になります。
- **紹介文の翻訳**も、上の翻訳スクリプトと同じ要領で
  「元の紹介文（英語/日本語）→ 各言語」へ機械翻訳→人手で確認、が効率的です。
- ストアのローカライズは、**実際に配信する国・言語に絞る**のがおすすめです
  （全言語ぶんのスクショ用意はコストが大きいため）。

# カシャカシャあそび

赤ちゃん（0〜2歳）向けの多感覚あそび知育アプリ。Web Audio API で
「カシャカシャ音」をその場で合成し、タッチすると音・光・形が反応します。

建設サイト（ZAIBASE）からは完全に独立したプロジェクトです。

## 開発

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動します（`/` は `/kashakasha` にリダイレクト）。

## 機能

- カシャカシャ音・胎内音モード・おやすみモード
- ごっこ遊び（おみせ・どうぶつえん・のりもの・おうち）
- まなびモード（すうじ・ABC・いろ）
- こもりうた（BGM）・ごほうびシール収集
- 音パック7種・テーマ11種
- チャイルドロック（誤操作防止）
- 多言語対応（英語・日本語ほか、全言語への自動翻訳の仕組み）
- 段階課金（無料／スタンダード／プロ／マックス）
- Capacitor によるネイティブアプリ化の土台（iOS/Android + RevenueCat IAP）

## ドキュメント

- `KEYS.md` — Stripe / RevenueCat / 翻訳APIキーの設定ガイド
- `MOBILE.md` — iOS/Androidネイティブ化の手順
- `STORE.md` — App Store / Google Play 掲載テキストのたたき台
- `TRANSLATE.md` — 全言語への自動翻訳の仕組みと手順
- `.env.example` — 環境変数の雛形（`cp .env.example .env.local` して使用）

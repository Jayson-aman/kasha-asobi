// カシャカシャあそび：多言語対応
//
// en は基準（en.json が唯一の元データ）。ja は手動で全文翻訳。
// その他の言語は 2 系統でまかないます：
//   1) CHROME … 手動翻訳（画面まわりの短い文言）。長文は en にフォールバック。
//   2) GENERATED … 翻訳APIで自動生成（scripts/translate-locales.mjs）。
//      generated-locales.json に全言語が入り、全文が対象。
// 言語追加：CHROME に足すか、翻訳スクリプトを実行して GENERATED を増やすだけ。

import enData from './en.json';
import GENERATED from './generated-locales.json';

export type PackId =
  | 'kasha'
  | 'doubutsu'
  | 'gakki'
  | 'taiko'
  | 'voice'
  | 'piano'
  | 'mizu';
export type ThemeId =
  | 'pastel'
  | 'yozora'
  | 'umi'
  | 'ohana'
  | 'uchuu'
  | 'mori'
  | 'niji'
  | 'haru'
  | 'natsu'
  | 'aki'
  | 'fuyu';

export interface Strings {
  nav: string;
  heroBadge: string;
  heroTitle: string;
  heroSub: string;
  start: string;
  startHint: string;
  startCaption: string;

  howToTitle: string;
  howTo: { icon: string; title: string; desc: string }[];

  reasonsTitle: string;
  reasonsLead: string;
  reasons: { icon: string; tag: string; title: string; body: string }[];

  pricingTitle: string;
  pricingLead: string;
  freeName: string;
  freeSub: string;
  freeCta: string;
  freeFeatures: string[];
  premiumName: string;
  recommended: string;
  premiumFeatures: string[];
  unlock: string;
  stripeNote: string;
  storageNote: string;

  ageTitle: string;
  ageLead: string;
  ageGuide: {
    age: string;
    stage: string;
    theme: string;
    intro: string;
    toys: { name: string; desc: string }[];
  }[];
  ageNote: string;

  safetyTitle: string;
  safety: string[];

  // あそばせ方のコツ・発達の効果
  tipsTitle: string;
  tipsLead: string;
  tips: { icon: string; title: string; desc: string }[];
  benefitsTitle: string;
  benefits: string[];

  // 遊び場の操作
  packLabel: string;
  themeLabel: string;
  packs: Record<string, string>;
  themes: Record<string, string>;
  voiceHintDone: string;
  voiceHintRec: string;
  recRetake: string;
  recording: string;
  soundOn: string;
  soundOff: string;
  wombOn: string;
  wombOff: string;
  sleep: string;
  timerNone: string;
  timer5: string;
  timer10: string;
  timer15: string;
  cleanup: string;
  counter: string; // "{n} ..." を含む
  premiumTag: string;
  sleepTag: string;
  bannerTitle: string;
  bannerSub: string;
  unlockPrice: string; // "{price}" を含む
  priceNote: string;
  paywallTitle: string;
  paywallSub: string;
  later: string;
  packWord: string; // 「〇〇」の後ろに付く語（例: sound pack / 音パック）
  themeWord: string;
  sleepName: string;
  timerName: string;
  timeUpTitle: string;
  timeUpSub: string; // "{m}" を含む
  again: string;
  wombFootnote: string;
  langLabel: string;

  // ゲームモード
  modeFree: string;
  modeGokko: string;
  modeLearn: string;
  gokkoHint: string;
  gokkoScenes: Record<string, string>;
  gokkoLabels: Record<string, string>;
  gokkoBubbles: Record<string, string>;
  learnHint: string;
  learnScenes: Record<string, string>;
  colorNames: Record<string, string>;

  // こもりうた・ごほうび
  bgmOn: string;
  bgmOff: string;
  rewardBtn: string;
  rewardTitle: string;
  rewardLead: string;
  rewardNew: string;

  // 誤操作防止ロック
  lock: string;
  lockedTitle: string;
  lockHold: string;
  unlockHint: string;
  restore: string;

  // あきない（課金）のパターン：段階的に開放されるティア制
  plansTitle: string;
  plansLead: string;
  cardNote: string;
  iosNote: string;
  tierIncludesNote: string;
  unlockWith: string; // "{plan}" を含む
  tierNames: string[]; // [無料, スタンダード, プロ, マックス]
  plans: {
    id: string;
    name: string;
    price: string;
    note: string;
    cta: string;
    tier: number;
    highlight?: boolean;
    unlocks: string[];
  }[];
  extras: { id: string; name: string; price: string; note: string; cta: string }[];
}

export const tpl = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

const ja: Strings = {
  nav: 'カシャカシャあそび',
  heroBadge: '👶 Multi-sensory Play for Babies',
  heroTitle: 'カシャカシャ あそび',
  heroSub:
    '赤ちゃんが大好きな「カシャカシャ音」を、その場で音として合成。画面をタッチすると音・光・形が同時に反応します。おうちの方といっしょに、安全に多感覚あそびを楽しめます。',
  start: '🔊 はじめる',
  startHint: 'ボタンをおして、がめんをタッチしてね',
  startCaption: '※ 音が出ます。おうちの方が音量を調整してあげてください。',

  howToTitle: 'あそび方',
  howTo: [
    ['👆', 'タッチする', 'がめんをトントン。カシャッと音がして光が弾けます。'],
    ['✍️', 'なぞる', '指をすべらせると、連続でカシャカシャ鳴ります。'],
    ['👶', '胎内音モード', 'ぐずり対策に。おなかの中の音でやさしく落ち着かせます。'],
  ].map(([icon, title, desc]) => ({ icon, title, desc })),

  reasonsTitle: 'なぜ赤ちゃんはカシャカシャ音に夢中になるの？',
  reasonsLead:
    'ただの雑音に思える音も、赤ちゃんには「安心感」と「脳を育てる大発見」が詰まっています。',
  reasons: [
    ['🤰', '安心感', '胎内音に似ているから', 'おなかの中でずっと聞いていた血流や胎盤の音は、高周波のザーザー・カシャカシャした音にとても近いといわれます。だから本能的に「安心できる場所」を思い出してホッとします。'],
    ['🔁', '脳の発達', '「原因と結果」の発見', '生後6ヶ月〜1歳頃、赤ちゃんは「自分が動かしたから音が鳴った！」という因果関係を理解し始めます。自分のアクションに100%の反応が返る体験が、最高のエンタメになります。'],
    ['🌈', '五感刺激', '多感覚（マルチセンサリー）', '高くてはっきりした音（聴覚）、クシャクシャ・ツルツルの感触（触覚）、光を反射してキラキラ形が変わる様子（視覚）を同時に刺激。視力が未発達な赤ちゃんにも存在感が抜群です。'],
    ['👀', '社会性', '大人のまね（ごっこ遊び）', '1歳半〜2歳頃には、音そのものより「大人のまね」として楽しむように。買い物袋をガサガサさせる姿を見て「自分もやってみたい！」という好奇心が芽生えます。'],
  ].map(([icon, tag, title, body]) => ({ icon, tag, title, body })),

  pricingTitle: 'りょうきん',
  pricingLead:
    '基本の「カシャカシャあそび」はずっと無料。もっと楽しみたくなったら、買い切りのプレミアムで全機能が使えます。',
  freeName: 'むりょう',
  freeSub: 'ずっと¥0',
  freeCta: 'いますぐ あそべる',
  freeFeatures: ['カシャカシャ音であそぶ', '胎内音モード', 'タッチ回数カウンター', 'ぱすてるテーマ'],
  premiumName: 'プレミアム',
  recommended: '✨ おすすめ',
  premiumFeatures: [
    '音パック追加（どうぶつ・がっき・わだいこ）',
    '録音＆再生（保護者の声であやす）',
    '使いすぎ防止タイマー／おやすみモード',
    'きせかえテーマ（よぞら・うみ・おはな）',
  ],
  unlock: '🔓 プレミアムを解放する',
  stripeNote: '決済は Stripe の安全なページで行われます。',
  storageNote:
    '※ 解放状態はご利用の端末に保存されます。決済まわりは Stripe が処理し、当サイトはカード情報を保持しません。',

  ageTitle: '月齢別・おすすめおもちゃガイド',
  ageLead:
    '成長にあわせて「響く音」も変わります。0〜2歳の発達段階に合ったおもちゃ選びの目安です。',
  ageGuide: [
    {
      age: '0歳',
      stage: 'ねんね・おすわり期',
      theme: 'カシャカシャ音が大活躍',
      intro:
        '視力がまだ未発達なため、耳から入る音に強く反応します。レジ袋のようなカサカサ音は胎内音に似ていて、泣き止んだり興味を持ったりしやすい時期です。',
      toys: [
        { name: '布絵本・カシャカシャ布おもちゃ', desc: '触るとレジ袋のような音が鳴る布製おもちゃ。専用玩具なら誤飲の心配がなく丸洗いできて衛生的。' },
        { name: 'ラトル（ガラガラ）・ビーズ入りボール', desc: '振るとシャカシャカ・リンリンと鳴るおもちゃ。網目状で握りやすいボールラトルはファーストトイの定番。' },
        { name: '引っ張り出し系おもちゃ', desc: 'ティッシュを抜く・新聞紙を破る感覚を再現した知育玩具。破る音とカシャカシャ音が1枚で楽しめます。' },
      ],
    },
    {
      age: '1歳',
      stage: 'よちよち・指先発達期',
      theme: '自分の行動で音が変わるもの',
      intro:
        'カシャカシャ音単体より、「叩く」「押す」など自分のアクションに音が返ってくるおもちゃに喜びを感じるようになります。',
      toys: [
        { name: '音の出る絵本・楽器おもちゃ', desc: 'ボタンを押すと歌や鳴き声が流れる絵本や、太鼓・木琴のように叩いて鳴らす楽器が大好きに。' },
        { name: 'ボール落とし・くるくるスロープ', desc: '入れたボールが転がりカタカタ・チリンと鳴る。「落とすと音が鳴る」因果関係を学びながら夢中で繰り返します。' },
        { name: 'プルトイ（引き車）', desc: '紐を引くと後ろの動物や車がカタカタついてくる。歩行の練習にもなり、動かす楽しさを味わえます。' },
      ],
    },
    {
      age: '2歳',
      stage: 'ごっこ遊び・見立て期',
      theme: '達成感や社会性を育むもの',
      intro:
        '手先が器用になり、想像力・認知力・社会性が一気に発達。音単体を卒業し「できた！」という達成感のあるものがヒットします。',
      toys: [
        { name: 'おままごとセット', desc: '野菜をザクッと切る音、お鍋のカチャカチャなど、日常のリアルな音を再現するごっこ遊びが大ブームに。' },
        { name: '型はめパズル・ブロック', desc: 'カチッとはまる感覚や、高く積んでドシャーンと崩す音・衝撃を楽しみます。' },
        { name: 'おしゃべり・言葉図鑑', desc: 'タッチペンでイラストに触れると名前や音が流れる。言葉の爆発期の知的好奇心にぴったりです。' },
      ],
    },
  ],
  ageNote: '※ 商品名は一般的な人気の例です。特定商品の推奨・宣伝を目的とするものではありません。',

  safetyTitle: '⚠️ 安全上の注意',
  safety: [
    '本物のビニール袋は、口や鼻を塞いで窒息する危険や、ちぎって誤飲するリスクがあります。赤ちゃんに直接遊ばせないでください。',
    '実物で遊ばせる際は、市販の「カシャカシャ布絵本」や「洗えるビニール風おもちゃ」など、赤ちゃん用の安全な玩具を使ってあげてください。',
    'このアプリは音が出ます。音量は大人が調整し、長時間の連続使用は避けてください。',
    'スマホ・タブレットで遊ぶ際は、必ず大人が付き添ってください。',
  ],

  tipsTitle: 'あそばせ方のコツ',
  tipsLead: 'おうちの方といっしょに、もっと楽しむためのヒント。',
  tips: [
    ['🤱', 'ひざの上で', 'だっこして安心できる姿勢で、いっしょにトントンしてあげましょう。'],
    ['🔉', 'やさしい音量で', '小さめの音から。赤ちゃんは大音量より、やわらかくはっきりした音が好きです。'],
    ['🗣️', 'ことばを添えて', '「キラキラ！」「ポン！」と実況すると、ことばの芽が育ちます。'],
    ['⏰', '短い時間で', '数分でじゅうぶん。タイマーでクールダウンを。'],
    ['🌙', '寝る前のルーティンに', '胎内音・おやすみモードで、お昼寝や就寝前にすーっと落ち着きます。'],
    ['👀', '赤ちゃんのペースで', 'くり返しこそ学びと喜び。ペースは赤ちゃんに合わせて。'],
  ].map(([icon, title, desc]) => ({ icon, title, desc })),
  benefitsTitle: '発達のうれしい効果',
  benefits: [
    '音→光→触感の、脳全体をつかう多感覚刺激',
    '「できた！」という因果関係の学び',
    'ぐずり対策・寝かしつけのサポート',
    '実況で育つ、ことばの芽',
    'ごっこ遊び・社会性のきっかけ',
  ],

  packLabel: '🎵 おとパック',
  themeLabel: '🎨 きせかえ',
  packs: { kasha: 'カシャカシャ', doubutsu: 'どうぶつ', gakki: 'がっき', taiko: 'わだいこ', voice: 'ろくおん', piano: 'ピアノ', mizu: 'みずおと' },
  themes: { pastel: 'ぱすてる', yozora: 'よぞら', umi: 'うみ', ohana: 'おはな', uchuu: 'うちゅう', mori: 'もり', niji: 'にじ', haru: 'はる', natsu: 'なつ', aki: 'あき', fuyu: 'ふゆ' },
  voiceHintDone: 'ろくおんした声でタッチしてあそべます。',
  voiceHintRec: 'マイクにむかって声を入れてください（最長3秒）。',
  recRetake: '🎤 とりなおす',
  recording: '● ろくおん中…',
  soundOn: '🔊 おと ON',
  soundOff: '🔇 おと OFF',
  wombOn: '👶 胎内音 ON',
  wombOff: '👶 胎内音 OFF',
  sleep: '🌙 おやすみ',
  timerNone: 'タイマーなし',
  timer5: '5ふん',
  timer10: '10ぷん',
  timer15: '15ふん',
  cleanup: '🧹 おかたづけ',
  counter: '{n} かい ♪',
  premiumTag: '✨ プレミアム',
  sleepTag: '🌙 おやすみ',
  bannerTitle: '✨ プレミアムでもっと楽しく',
  bannerSub: '音パック・録音・タイマー・きせかえが全部使えます',
  unlockPrice: '🔓 {price} で解放する',
  priceNote: '買い切り・追加課金なし',
  paywallTitle: 'プレミアム機能です',
  paywallSub: '一度解放すれば、下ぜんぶが使えます。',
  later: 'あとで',
  packWord: 'の音パック',
  themeWord: 'テーマ',
  sleepName: 'おやすみモード',
  timerName: '使いすぎ防止タイマー',
  timeUpTitle: 'おしまい',
  timeUpSub: '{m}ぷん あそびました。ひとやすみしようね。',
  again: '🔄 もういちど',
  wombFootnote:
    '胎内音モードは、おなかの中で聞いていた血流の音を再現した「やさしいザーッ」という音です。',
  langLabel: '言語',

  modeFree: '🎵 じゆうあそび',
  modeGokko: '🏪 おみせやさん',
  modeLearn: '🔢 まなび',
  learnHint: 'タッチすると大きくなって音がなるよ。',
  learnScenes: { num: '123 すうじ', abc: 'ABC', iro: '🎨 いろ' },
  colorNames: { aka: 'あか', ao: 'あお', kiiro: 'きいろ', midori: 'みどり', orange: 'オレンジ', murasaki: 'むらさき', pink: 'ぴんく', shiro: 'しろ', kuro: 'くろ' },
  bgmOn: '🎵 こもりうた ON',
  bgmOff: '🎵 こもりうた OFF',
  rewardBtn: '🏅 ごほうび',
  rewardTitle: '🏅 ごほうびシール',
  rewardLead: 'たくさんあそぶと シールがもらえるよ！',
  rewardNew: 'あたらしいシール！🎉',
  gokkoHint: 'タッチ！ 音とことばでおへんじします。',
  gokkoScenes: { shop: '🏪 おみせ', zoo: '🦁 どうぶつえん', ride: '🚃 のりもの', home: '🏠 おうち' },
  gokkoLabels: {
    bell: 'ベル',
    cake: 'ケーキ',
    register: 'レジ',
    juice: 'ジュース',
    gift: 'プレゼント',
    dog: 'わんちゃん',
    icecream: 'アイス',
    balloon: 'ふうせん',
    car: 'くるま',
    lion: 'ライオン',
    elephant: 'ぞう',
    monkey: 'さる',
    bird: 'ことり',
    frog: 'かえる',
    cow: 'うし',
    cat: 'ねこ',
    sheep: 'ひつじ',
    duck: 'あひる',
    densha: 'でんしゃ',
    hikouki: 'ひこうき',
    fune: 'ふね',
    bus: 'バス',
    kyukyu: 'きゅうきゅうしゃ',
    shoubou: 'しょうぼうしゃ',
    rocket: 'ロケット',
    jitensha: 'じてんしゃ',
    heli: 'ヘリコプター',
    door: 'ドア',
    phone: 'でんわ',
    clock: 'とけい',
    tv: 'テレビ',
    bath: 'おふろ',
    kettle: 'やかん',
    light: 'あかり',
    rice: 'ごはん',
    bed: 'おふとん',
  },
  gokkoBubbles: {
    bell: 'いらっしゃいませ！🔔',
    cake: 'はい、ケーキ！🍰',
    register: 'チーン♪ おかいけい 🧾',
    juice: 'どうぞ！🥤',
    gift: 'できあがり！🎁',
    dog: 'ワンワン！🐶',
    icecream: 'アイスどうぞ！🍦',
    balloon: 'パチン！🎈',
    car: 'ブッブー！🚗',
    lion: 'ガオー！🦁',
    elephant: 'パオーン！🐘',
    monkey: 'ウキー！🐵',
    bird: 'ピピピ！🐦',
    frog: 'ケロケロ！🐸',
    cow: 'モーモー！🐄',
    cat: 'ニャー！🐱',
    sheep: 'メェー！🐑',
    duck: 'ガーガー！🦆',
    densha: 'ガタンゴトン！🚃',
    hikouki: 'ブーン✈️',
    fune: 'ボーッ⛵',
    bus: 'ブブー🚌',
    kyukyu: 'ピーポー🚑',
    shoubou: 'ウーウー🚒',
    rocket: 'ゴー！🚀',
    jitensha: 'チリンチリン🚲',
    heli: 'バタバタ🚁',
    door: 'トントン！🚪',
    phone: 'リリリン☎️',
    clock: 'カチカチ🕰️',
    tv: 'ジャーン📺',
    bath: 'ちゃぷちゃぷ🛁',
    kettle: 'ピー🫖',
    light: 'パチッ💡',
    rice: 'もぐもぐ🍚',
    bed: 'おやすみ🛏️',
  },

  lock: '🔒 チャイルドロック',
  lockedTitle: '🔒 ロック中',
  lockHold: 'おしつづけてね…',
  unlockHint: 'ながおしで かいじょ',
  restore: '🔁 購入を復元',

  plansTitle: 'プラン — だんだん開放',
  plansLead:
    '上位プランほど機能が「開いて」いきます。買い切りは継続しにくいため、続けやすいサブスクを主力に。決済はすべて Stripe が安全に処理します。',
  cardNote:
    '💳 クレジットカード（Visa / Mastercard / JCB / Amex）・Apple Pay・Google Pay に対応（Stripe経由）。',
  iosNote:
    '📱 iPhoneでは「共有 →『ホーム画面に追加』」でアプリのように使えます。App Store のネイティブ版（アプリ内サブスク）は今後の対応予定です。',
  tierIncludesNote: '上位プランは、下位プランの機能をすべて含みます。',
  unlockWith: '{plan}で開放',
  tierNames: ['無料', 'スタンダード', 'プロ', 'マックス'],
  plans: [
    { id: 'monthly', name: 'スタンダード・月額', price: '¥380', note: '/月・いつでも解約OK', cta: '登録する', tier: 1, highlight: true, unlocks: ['音パック（どうぶつ・がっき・わだいこ）', 'きせかえテーマ（よぞら・うみ・おはな）'] },
    { id: 'yearly', name: 'スタンダード・年額', price: '¥3,800', note: '/年・2ヶ月分お得', cta: '登録する', tier: 1, unlocks: ['スタンダードの全機能', '2ヶ月分お得でいちばんお得'] },
    { id: 'pro', name: 'プロ', price: '¥780', note: '/月', cta: 'プロにする', tier: 2, unlocks: ['録音＆再生（保護者の声）', '使いすぎ防止タイマー／おやすみ'] },
    { id: 'max', name: 'マックス', price: '¥1,280', note: '/月', cta: 'マックスにする', tier: 3, unlocks: ['うちゅうテーマ＆今後のテーマ全部', '以降の全機能を無制限'] },
  ],
  extras: [
    { id: 'onetime', name: '買い切り（スタンダード）', price: '¥2,400', note: '一度でずっと使える', cta: '購入する' },
    { id: 'tip', name: '応援・投げ銭', price: '任意', note: '気に入ったら応援', cta: '応援する' },
    { id: 'gift', name: 'ギフト', price: '¥2,400', note: 'お友だちにプレゼント', cta: 'ギフトする' },
    { id: 'business', name: '保育園・法人向け', price: '要相談', note: '施設・クリニック向け', cta: 'お問い合わせ' },
  ],
};

// --- その他の言語（画面まわりの短い文言を翻訳。長文は en にフォールバック）---
type Chrome = Partial<Strings>;

const CHROME: Record<string, Chrome> = {
  'zh-Hans': {
    nav: '沙沙作响的玩耍',
    heroTitle: '沙沙作响的玩耍',
    heroSub:
      '宝宝最喜欢“沙沙”声。这个应用会即时合成它——触摸屏幕，声音、光和形状会一起回应。和宝宝一起安全地进行多感官游戏吧。',
    start: '🔊 开始',
    startHint: '按下按钮，然后触摸屏幕',
    startCaption: '※ 应用会发出声音，请由成人调节音量。',
    howToTitle: '玩法',
    reasonsTitle: '为什么宝宝这么着迷于沙沙声？',
    pricingTitle: '价格',
    freeName: '免费',
    premiumName: '高级版',
    recommended: '✨ 推荐',
    unlock: '🔓 解锁高级版',
    ageTitle: '按月龄推荐玩具',
    safetyTitle: '⚠️ 安全提示',
    packLabel: '🎵 声音包',
    themeLabel: '🎨 换装',
    packs: { kasha: '沙沙', doubutsu: '动物', gakki: '乐器', taiko: '太鼓', voice: '录音' },
    themes: { pastel: '粉彩', yozora: '夜空', umi: '海洋', ohana: '花朵' },
    soundOn: '🔊 声音 ON',
    soundOff: '🔇 声音 OFF',
    wombOn: '👶 胎内音 ON',
    wombOff: '👶 胎内音 OFF',
    sleep: '🌙 睡眠',
    timerNone: '无定时',
    timer5: '5分钟',
    timer10: '10分钟',
    timer15: '15分钟',
    cleanup: '🧹 收拾',
    counter: '{n} 次 ♪',
    premiumTag: '✨ 高级版',
    sleepTag: '🌙 睡眠',
    bannerTitle: '✨ 高级版更好玩',
    unlockPrice: '🔓 {price} 解锁',
    priceNote: '一次性购买 · 无额外收费',
    paywallTitle: '这是高级版功能',
    paywallSub: '解锁一次，下面全部可用。',
    later: '稍后',
    packWord: ' 声音包',
    themeWord: ' 主题',
    sleepName: '睡眠模式',
    timerName: '使用时长定时',
    timeUpTitle: '结束啦',
    timeUpSub: '玩了 {m} 分钟，休息一下吧。',
    again: '🔄 再玩一次',
    langLabel: '语言',
  },
  'zh-Hant': {
    nav: '沙沙作響的玩耍',
    heroTitle: '沙沙作響的玩耍',
    heroSub:
      '寶寶最喜歡「沙沙」聲。這個應用會即時合成它——觸摸螢幕，聲音、光與形狀會一起回應。和寶寶一起安全地進行多感官遊戲吧。',
    start: '🔊 開始',
    startHint: '按下按鈕，然後觸摸螢幕',
    startCaption: '※ 應用會發出聲音，請由成人調整音量。',
    howToTitle: '玩法',
    reasonsTitle: '為什麼寶寶這麼著迷於沙沙聲？',
    pricingTitle: '價格',
    freeName: '免費',
    premiumName: '進階版',
    recommended: '✨ 推薦',
    unlock: '🔓 解鎖進階版',
    ageTitle: '依月齡推薦玩具',
    safetyTitle: '⚠️ 安全提示',
    packLabel: '🎵 聲音包',
    themeLabel: '🎨 換裝',
    packs: { kasha: '沙沙', doubutsu: '動物', gakki: '樂器', taiko: '太鼓', voice: '錄音' },
    themes: { pastel: '粉彩', yozora: '夜空', umi: '海洋', ohana: '花朵' },
    soundOn: '🔊 聲音 ON',
    soundOff: '🔇 聲音 OFF',
    wombOn: '👶 胎內音 ON',
    wombOff: '👶 胎內音 OFF',
    sleep: '🌙 睡眠',
    timerNone: '無定時',
    timer5: '5分鐘',
    timer10: '10分鐘',
    timer15: '15分鐘',
    cleanup: '🧹 收拾',
    counter: '{n} 次 ♪',
    premiumTag: '✨ 進階版',
    sleepTag: '🌙 睡眠',
    bannerTitle: '✨ 進階版更好玩',
    unlockPrice: '🔓 {price} 解鎖',
    priceNote: '一次買斷 · 無額外收費',
    paywallTitle: '這是進階版功能',
    paywallSub: '解鎖一次，下面全部可用。',
    later: '稍後',
    packWord: ' 聲音包',
    themeWord: ' 主題',
    sleepName: '睡眠模式',
    timerName: '使用時長定時',
    timeUpTitle: '結束囉',
    timeUpSub: '玩了 {m} 分鐘，休息一下吧。',
    again: '🔄 再玩一次',
    langLabel: '語言',
  },
  ko: {
    nav: '바스락 놀이',
    heroTitle: '바스락 놀이',
    heroSub:
      '아기가 좋아하는 “바스락” 소리를 실시간으로 합성해요. 화면을 터치하면 소리·빛·모양이 함께 반응합니다. 아이와 함께 안전하게 다감각 놀이를 즐겨보세요.',
    start: '🔊 시작하기',
    startHint: '버튼을 누르고 화면을 터치하세요',
    startCaption: '※ 소리가 납니다. 어른이 음량을 조절해 주세요.',
    howToTitle: '놀이 방법',
    reasonsTitle: '아기는 왜 바스락 소리에 빠져들까요?',
    pricingTitle: '요금',
    freeName: '무료',
    premiumName: '프리미엄',
    recommended: '✨ 추천',
    unlock: '🔓 프리미엄 잠금 해제',
    ageTitle: '월령별 추천 장난감',
    safetyTitle: '⚠️ 안전 주의',
    packLabel: '🎵 소리 팩',
    themeLabel: '🎨 꾸미기',
    packs: { kasha: '바스락', doubutsu: '동물', gakki: '악기', taiko: '북', voice: '녹음' },
    themes: { pastel: '파스텔', yozora: '밤하늘', umi: '바다', ohana: '꽃' },
    soundOn: '🔊 소리 ON',
    soundOff: '🔇 소리 OFF',
    wombOn: '👶 태내음 ON',
    wombOff: '👶 태내음 OFF',
    sleep: '🌙 잘자요',
    timerNone: '타이머 없음',
    timer5: '5분',
    timer10: '10분',
    timer15: '15분',
    cleanup: '🧹 정리',
    counter: '{n} 번 ♪',
    premiumTag: '✨ 프리미엄',
    sleepTag: '🌙 잘자요',
    bannerTitle: '✨ 프리미엄으로 더 재미있게',
    unlockPrice: '🔓 {price}에 잠금 해제',
    priceNote: '한 번 구매 · 추가 결제 없음',
    paywallTitle: '프리미엄 기능입니다',
    paywallSub: '한 번 해제하면 아래 모두 사용할 수 있어요.',
    later: '나중에',
    packWord: ' 소리 팩',
    themeWord: ' 테마',
    sleepName: '잘자요 모드',
    timerName: '사용시간 타이머',
    timeUpTitle: '끝!',
    timeUpSub: '{m}분 놀았어요. 잠깐 쉬어요.',
    again: '🔄 다시 하기',
    langLabel: '언어',
  },
  es: {
    nav: 'Juego crujiente',
    heroTitle: 'Juego crujiente',
    heroSub:
      'A los bebés les encanta el sonido crujiente. Esta app lo sintetiza en vivo: toca la pantalla y el sonido, la luz y las formas responden juntos. Disfruta de un juego multisensorial seguro con tu bebé.',
    start: '🔊 Empezar',
    startHint: 'Pulsa el botón y toca la pantalla',
    startCaption: '※ Esta app emite sonido. Un adulto debe ajustar el volumen.',
    howToTitle: 'Cómo jugar',
    reasonsTitle: '¿Por qué fascina tanto a los bebés el sonido crujiente?',
    pricingTitle: 'Precios',
    freeName: 'Gratis',
    premiumName: 'Premium',
    recommended: '✨ Recomendado',
    unlock: '🔓 Desbloquear Premium',
    ageTitle: 'Guía de juguetes por edad',
    safetyTitle: '⚠️ Notas de seguridad',
    packLabel: '🎵 Pack de sonidos',
    themeLabel: '🎨 Temas',
    packs: { kasha: 'Crujido', doubutsu: 'Animales', gakki: 'Instrumentos', taiko: 'Tambor', voice: 'Grabación' },
    themes: { pastel: 'Pastel', yozora: 'Cielo nocturno', umi: 'Mar', ohana: 'Flores' },
    soundOn: '🔊 Sonido ON',
    soundOff: '🔇 Sonido OFF',
    wombOn: '👶 Sonido uterino ON',
    wombOff: '👶 Sonido uterino OFF',
    sleep: '🌙 Dormir',
    timerNone: 'Sin temporizador',
    timer5: '5 min',
    timer10: '10 min',
    timer15: '15 min',
    cleanup: '🧹 Recoger',
    counter: '{n} veces ♪',
    premiumTag: '✨ Premium',
    sleepTag: '🌙 Dormir',
    bannerTitle: '✨ Más diversión con Premium',
    unlockPrice: '🔓 Desbloquear por {price}',
    priceNote: 'Pago único · sin cargos extra',
    paywallTitle: 'Es una función Premium',
    paywallSub: 'Desbloquéalo una vez y usa todo lo de abajo.',
    later: 'Más tarde',
    packWord: ' pack de sonidos',
    themeWord: ' tema',
    sleepName: 'Modo dormir',
    timerName: 'Temporizador de uso',
    timeUpTitle: 'Se acabó',
    timeUpSub: 'Jugaste {m} min. Hora de descansar un poco.',
    again: '🔄 Jugar otra vez',
    langLabel: 'Idioma',
  },
  fr: {
    nav: 'Jeu froissé',
    heroTitle: 'Jeu froissé',
    heroSub:
      "Les bébés adorent le bruit de froissement. Cette appli le synthétise en direct : touchez l'écran et le son, la lumière et les formes réagissent ensemble. Profitez d'un jeu multisensoriel en toute sécurité avec votre bébé.",
    start: '🔊 Commencer',
    startHint: "Appuyez sur le bouton, puis touchez l'écran",
    startCaption: '※ Cette appli émet du son. Un adulte doit régler le volume.',
    howToTitle: 'Comment jouer',
    reasonsTitle: 'Pourquoi les bébés sont-ils si captivés par ce bruit ?',
    pricingTitle: 'Tarifs',
    freeName: 'Gratuit',
    premiumName: 'Premium',
    recommended: '✨ Recommandé',
    unlock: '🔓 Débloquer Premium',
    ageTitle: 'Guide des jouets par âge',
    safetyTitle: '⚠️ Consignes de sécurité',
    packLabel: '🎵 Pack de sons',
    themeLabel: '🎨 Habillage',
    packs: { kasha: 'Froissé', doubutsu: 'Animaux', gakki: 'Instruments', taiko: 'Tambour', voice: 'Enregistrement' },
    themes: { pastel: 'Pastel', yozora: 'Ciel nocturne', umi: 'Mer', ohana: 'Fleurs' },
    soundOn: '🔊 Son ON',
    soundOff: '🔇 Son OFF',
    wombOn: '👶 Son utérin ON',
    wombOff: '👶 Son utérin OFF',
    sleep: '🌙 Dodo',
    timerNone: 'Sans minuteur',
    timer5: '5 min',
    timer10: '10 min',
    timer15: '15 min',
    cleanup: '🧹 Ranger',
    counter: '{n} fois ♪',
    premiumTag: '✨ Premium',
    sleepTag: '🌙 Dodo',
    bannerTitle: '✨ Plus de plaisir avec Premium',
    unlockPrice: '🔓 Débloquer pour {price}',
    priceNote: 'Achat unique · sans frais supplémentaires',
    paywallTitle: 'Fonction Premium',
    paywallSub: 'Débloquez une fois et profitez de tout ci-dessous.',
    later: 'Plus tard',
    packWord: ' pack de sons',
    themeWord: ' thème',
    sleepName: 'Mode dodo',
    timerName: "Minuteur d'utilisation",
    timeUpTitle: 'Terminé',
    timeUpSub: 'Tu as joué {m} min. Un peu de repos maintenant.',
    again: '🔄 Rejouer',
    langLabel: 'Langue',
  },
  de: {
    nav: 'Raschelspiel',
    heroTitle: 'Raschelspiel',
    heroSub:
      'Babys lieben das raschelnde Geräusch. Diese App erzeugt es live – berühre den Bildschirm, und Klang, Licht und Formen reagieren gemeinsam. Genieße sicheres, multisensorisches Spielen mit deinem Baby.',
    start: '🔊 Start',
    startHint: 'Taste drücken und den Bildschirm berühren',
    startCaption: '※ Diese App macht Geräusche. Ein Erwachsener sollte die Lautstärke einstellen.',
    howToTitle: 'So wird gespielt',
    reasonsTitle: 'Warum fasziniert das Rascheln Babys so sehr?',
    pricingTitle: 'Preise',
    freeName: 'Kostenlos',
    premiumName: 'Premium',
    recommended: '✨ Empfohlen',
    unlock: '🔓 Premium freischalten',
    ageTitle: 'Spielzeug-Guide nach Alter',
    safetyTitle: '⚠️ Sicherheitshinweise',
    packLabel: '🎵 Klangpaket',
    themeLabel: '🎨 Verkleiden',
    packs: { kasha: 'Rascheln', doubutsu: 'Tiere', gakki: 'Instrumente', taiko: 'Trommel', voice: 'Aufnahme' },
    themes: { pastel: 'Pastell', yozora: 'Nachthimmel', umi: 'Meer', ohana: 'Blumen' },
    soundOn: '🔊 Ton AN',
    soundOff: '🔇 Ton AUS',
    wombOn: '👶 Mutterleib-Ton AN',
    wombOff: '👶 Mutterleib-Ton AUS',
    sleep: '🌙 Schlafen',
    timerNone: 'Kein Timer',
    timer5: '5 Min',
    timer10: '10 Min',
    timer15: '15 Min',
    cleanup: '🧹 Aufräumen',
    counter: '{n} mal ♪',
    premiumTag: '✨ Premium',
    sleepTag: '🌙 Schlafen',
    bannerTitle: '✨ Mehr Spaß mit Premium',
    unlockPrice: '🔓 Für {price} freischalten',
    priceNote: 'Einmalkauf · keine Zusatzkosten',
    paywallTitle: 'Das ist eine Premium-Funktion',
    paywallSub: 'Einmal freischalten und alles unten nutzen.',
    later: 'Später',
    packWord: ' Klangpaket',
    themeWord: ' Thema',
    sleepName: 'Schlafmodus',
    timerName: 'Nutzungs-Timer',
    timeUpTitle: 'Fertig',
    timeUpSub: 'Du hast {m} Min gespielt. Zeit für eine kleine Pause.',
    again: '🔄 Nochmal spielen',
    langLabel: 'Sprache',
  },
  pt: {
    nav: 'Brincadeira farfalhante',
    heroTitle: 'Brincadeira farfalhante',
    heroSub:
      'Os bebês adoram o som farfalhante. Este app o sintetiza ao vivo: toque na tela e som, luz e formas respondem juntos. Aproveite uma brincadeira multissensorial segura com seu bebê.',
    start: '🔊 Começar',
    startHint: 'Pressione o botão e toque na tela',
    startCaption: '※ Este app emite som. Um adulto deve ajustar o volume.',
    howToTitle: 'Como brincar',
    reasonsTitle: 'Por que os bebês ficam tão fascinados pelo som?',
    pricingTitle: 'Preços',
    freeName: 'Grátis',
    premiumName: 'Premium',
    recommended: '✨ Recomendado',
    unlock: '🔓 Desbloquear Premium',
    ageTitle: 'Guia de brinquedos por idade',
    safetyTitle: '⚠️ Notas de segurança',
    packLabel: '🎵 Pacote de sons',
    themeLabel: '🎨 Temas',
    packs: { kasha: 'Farfalhar', doubutsu: 'Animais', gakki: 'Instrumentos', taiko: 'Tambor', voice: 'Gravação' },
    themes: { pastel: 'Pastel', yozora: 'Céu noturno', umi: 'Mar', ohana: 'Flores' },
    soundOn: '🔊 Som ON',
    soundOff: '🔇 Som OFF',
    wombOn: '👶 Som do útero ON',
    wombOff: '👶 Som do útero OFF',
    sleep: '🌙 Dormir',
    timerNone: 'Sem timer',
    timer5: '5 min',
    timer10: '10 min',
    timer15: '15 min',
    cleanup: '🧹 Arrumar',
    counter: '{n} vezes ♪',
    premiumTag: '✨ Premium',
    sleepTag: '🌙 Dormir',
    bannerTitle: '✨ Mais diversão com Premium',
    unlockPrice: '🔓 Desbloquear por {price}',
    priceNote: 'Compra única · sem cobranças extras',
    paywallTitle: 'É um recurso Premium',
    paywallSub: 'Desbloqueie uma vez e use tudo abaixo.',
    later: 'Depois',
    packWord: ' pacote de sons',
    themeWord: ' tema',
    sleepName: 'Modo dormir',
    timerName: 'Timer de uso',
    timeUpTitle: 'Acabou',
    timeUpSub: 'Você brincou {m} min. Hora de descansar um pouco.',
    again: '🔄 Brincar de novo',
    langLabel: 'Idioma',
  },
  ru: {
    nav: 'Шуршащая игра',
    heroTitle: 'Шуршащая игра',
    heroSub:
      'Малыши обожают шуршащий звук. Это приложение синтезирует его вживую: коснитесь экрана — и звук, свет и формы отзовутся вместе. Наслаждайтесь безопасной мультисенсорной игрой с малышом.',
    start: '🔊 Начать',
    startHint: 'Нажмите кнопку и коснитесь экрана',
    startCaption: '※ Приложение издаёт звук. Пусть взрослый настроит громкость.',
    howToTitle: 'Как играть',
    reasonsTitle: 'Почему малышей так завораживает шуршание?',
    pricingTitle: 'Цены',
    freeName: 'Бесплатно',
    premiumName: 'Премиум',
    recommended: '✨ Рекомендуем',
    unlock: '🔓 Открыть Премиум',
    ageTitle: 'Игрушки по возрасту',
    safetyTitle: '⚠️ Безопасность',
    packLabel: '🎵 Набор звуков',
    themeLabel: '🎨 Оформление',
    packs: { kasha: 'Шуршание', doubutsu: 'Животные', gakki: 'Инструменты', taiko: 'Барабан', voice: 'Запись' },
    themes: { pastel: 'Пастель', yozora: 'Ночное небо', umi: 'Море', ohana: 'Цветы' },
    soundOn: '🔊 Звук ВКЛ',
    soundOff: '🔇 Звук ВЫКЛ',
    wombOn: '👶 Звук утробы ВКЛ',
    wombOff: '👶 Звук утробы ВЫКЛ',
    sleep: '🌙 Сон',
    timerNone: 'Без таймера',
    timer5: '5 мин',
    timer10: '10 мин',
    timer15: '15 мин',
    cleanup: '🧹 Убрать',
    counter: '{n} раз ♪',
    premiumTag: '✨ Премиум',
    sleepTag: '🌙 Сон',
    bannerTitle: '✨ Больше веселья с Премиум',
    unlockPrice: '🔓 Открыть за {price}',
    priceNote: 'Разовая покупка · без доплат',
    paywallTitle: 'Это функция Премиум',
    paywallSub: 'Откройте один раз — и всё ниже доступно.',
    later: 'Позже',
    packWord: ' набор звуков',
    themeWord: ' тема',
    sleepName: 'Режим сна',
    timerName: 'Таймер использования',
    timeUpTitle: 'Всё!',
    timeUpSub: 'Ты играл {m} мин. Пора немного отдохнуть.',
    again: '🔄 Ещё раз',
    langLabel: 'Язык',
  },
  ar: {
    nav: 'لعبة الحفيف',
    heroTitle: 'لعبة الحفيف',
    heroSub:
      'يحب الأطفال صوت الحفيف. يولّد هذا التطبيق الصوت مباشرة: المس الشاشة فيتجاوب الصوت والضوء والأشكال معًا. استمتع بلعب متعدد الحواس وآمن مع طفلك.',
    start: '🔊 ابدأ',
    startHint: 'اضغط الزر ثم المس الشاشة',
    startCaption: '※ يصدر التطبيق صوتًا. ليضبط شخص بالغ مستوى الصوت.',
    howToTitle: 'طريقة اللعب',
    reasonsTitle: 'لماذا ينجذب الأطفال إلى صوت الحفيف؟',
    pricingTitle: 'الأسعار',
    freeName: 'مجاني',
    premiumName: 'المميز',
    recommended: '✨ موصى به',
    unlock: '🔓 فتح المميز',
    ageTitle: 'دليل الألعاب حسب العمر',
    safetyTitle: '⚠️ ملاحظات السلامة',
    packLabel: '🎵 حزمة الأصوات',
    themeLabel: '🎨 التزيين',
    packs: { kasha: 'حفيف', doubutsu: 'حيوانات', gakki: 'آلات', taiko: 'طبل', voice: 'تسجيل' },
    themes: { pastel: 'باستيل', yozora: 'سماء الليل', umi: 'البحر', ohana: 'أزهار' },
    soundOn: '🔊 الصوت ON',
    soundOff: '🔇 الصوت OFF',
    wombOn: '👶 صوت الرحم ON',
    wombOff: '👶 صوت الرحم OFF',
    sleep: '🌙 نوم',
    timerNone: 'بدون مؤقّت',
    timer5: '5 دقائق',
    timer10: '10 دقائق',
    timer15: '15 دقيقة',
    cleanup: '🧹 ترتيب',
    counter: '{n} مرّة ♪',
    premiumTag: '✨ المميز',
    sleepTag: '🌙 نوم',
    bannerTitle: '✨ متعة أكبر مع المميز',
    unlockPrice: '🔓 افتح مقابل {price}',
    priceNote: 'دفعة واحدة · بلا رسوم إضافية',
    paywallTitle: 'هذه ميزة مميّزة',
    paywallSub: 'افتحها مرة واحدة واستخدم كل ما بالأسفل.',
    later: 'لاحقًا',
    packWord: ' حزمة أصوات',
    themeWord: ' سمة',
    sleepName: 'وضع النوم',
    timerName: 'مؤقّت الاستخدام',
    timeUpTitle: 'انتهى',
    timeUpSub: 'لعبت {m} دقيقة. حان وقت راحة قصيرة.',
    again: '🔄 العب مرة أخرى',
    langLabel: 'اللغة',
  },
  hi: {
    nav: 'सरसराहट खेल',
    heroTitle: 'सरसराहट खेल',
    heroSub:
      'शिशुओं को सरसराहट की आवाज़ बहुत पसंद होती है। यह ऐप उसे तुरंत बनाता है — स्क्रीन छुएँ और आवाज़, रोशनी व आकृतियाँ एक साथ प्रतिक्रिया देती हैं। अपने शिशु के साथ सुरक्षित बहु-संवेदी खेल का आनंद लें।',
    start: '🔊 शुरू करें',
    startHint: 'बटन दबाएँ, फिर स्क्रीन छुएँ',
    startCaption: '※ यह ऐप आवाज़ करता है। कृपया कोई बड़ा वॉल्यूम समायोजित करे।',
    howToTitle: 'कैसे खेलें',
    reasonsTitle: 'शिशु सरसराहट की आवाज़ में इतने क्यों खो जाते हैं?',
    pricingTitle: 'मूल्य',
    freeName: 'मुफ़्त',
    premiumName: 'प्रीमियम',
    recommended: '✨ अनुशंसित',
    unlock: '🔓 प्रीमियम अनलॉक करें',
    ageTitle: 'उम्र के अनुसार खिलौना गाइड',
    safetyTitle: '⚠️ सुरक्षा सूचनाएँ',
    packLabel: '🎵 ध्वनि पैक',
    themeLabel: '🎨 सजावट',
    packs: { kasha: 'सरसराहट', doubutsu: 'जानवर', gakki: 'वाद्य', taiko: 'ढोल', voice: 'रिकॉर्डिंग' },
    themes: { pastel: 'पेस्टल', yozora: 'रात का आसमान', umi: 'समुद्र', ohana: 'फूल' },
    soundOn: '🔊 ध्वनि ON',
    soundOff: '🔇 ध्वनि OFF',
    wombOn: '👶 गर्भ ध्वनि ON',
    wombOff: '👶 गर्भ ध्वनि OFF',
    sleep: '🌙 नींद',
    timerNone: 'कोई टाइमर नहीं',
    timer5: '5 मिनट',
    timer10: '10 मिनट',
    timer15: '15 मिनट',
    cleanup: '🧹 समेटें',
    counter: '{n} बार ♪',
    premiumTag: '✨ प्रीमियम',
    sleepTag: '🌙 नींद',
    bannerTitle: '✨ प्रीमियम के साथ और मज़ा',
    unlockPrice: '🔓 {price} में अनलॉक करें',
    priceNote: 'एक बार खरीद · कोई अतिरिक्त शुल्क नहीं',
    paywallTitle: 'यह एक प्रीमियम सुविधा है',
    paywallSub: 'एक बार अनलॉक करें और नीचे सब कुछ उपयोग करें।',
    later: 'बाद में',
    packWord: ' ध्वनि पैक',
    themeWord: ' थीम',
    sleepName: 'नींद मोड',
    timerName: 'उपयोग टाइमर',
    timeUpTitle: 'हो गया',
    timeUpSub: 'तुमने {m} मिनट खेला। थोड़ा आराम करें।',
    again: '🔄 फिर से खेलें',
    langLabel: 'भाषा',
  },
  id: {
    nav: 'Main gemerisik',
    heroTitle: 'Main gemerisik',
    heroSub:
      'Bayi menyukai suara gemerisik. Aplikasi ini menyintesisnya secara langsung — sentuh layar dan suara, cahaya, serta bentuk merespons bersamaan. Nikmati permainan multisensori yang aman bersama bayi Anda.',
    start: '🔊 Mulai',
    startHint: 'Tekan tombol, lalu sentuh layar',
    startCaption: '※ Aplikasi ini mengeluarkan suara. Mohon orang dewasa mengatur volume.',
    howToTitle: 'Cara bermain',
    reasonsTitle: 'Mengapa bayi begitu terpikat pada suara gemerisik?',
    pricingTitle: 'Harga',
    freeName: 'Gratis',
    premiumName: 'Premium',
    recommended: '✨ Direkomendasikan',
    unlock: '🔓 Buka Premium',
    ageTitle: 'Panduan mainan menurut usia',
    safetyTitle: '⚠️ Catatan keamanan',
    packLabel: '🎵 Paket suara',
    themeLabel: '🎨 Ganti tema',
    packs: { kasha: 'Gemerisik', doubutsu: 'Hewan', gakki: 'Alat musik', taiko: 'Genderang', voice: 'Rekaman' },
    themes: { pastel: 'Pastel', yozora: 'Langit malam', umi: 'Laut', ohana: 'Bunga' },
    soundOn: '🔊 Suara ON',
    soundOff: '🔇 Suara OFF',
    wombOn: '👶 Suara rahim ON',
    wombOff: '👶 Suara rahim OFF',
    sleep: '🌙 Tidur',
    timerNone: 'Tanpa timer',
    timer5: '5 mnt',
    timer10: '10 mnt',
    timer15: '15 mnt',
    cleanup: '🧹 Beres-beres',
    counter: '{n} kali ♪',
    premiumTag: '✨ Premium',
    sleepTag: '🌙 Tidur',
    bannerTitle: '✨ Lebih seru dengan Premium',
    unlockPrice: '🔓 Buka seharga {price}',
    priceNote: 'Sekali beli · tanpa biaya tambahan',
    paywallTitle: 'Ini fitur Premium',
    paywallSub: 'Buka sekali dan gunakan semua di bawah.',
    later: 'Nanti',
    packWord: ' paket suara',
    themeWord: ' tema',
    sleepName: 'Mode tidur',
    timerName: 'Timer pemakaian',
    timeUpTitle: 'Selesai',
    timeUpSub: 'Kamu bermain {m} menit. Waktunya istirahat sebentar.',
    again: '🔄 Main lagi',
    langLabel: 'Bahasa',
  },
};

const en = enData as Strings;
const GEN = GENERATED as Record<string, Partial<Strings>>;

// 右→左表記の言語（基底コードで判定）
const RTL = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'sd', 'ug', 'yi']);
const baseOf = (c: string) => c.split('-')[0];

// 言語コード → 現地語表記（スイッチャーのラベル＆翻訳スクリプトの対象一覧）。
// ここに足すだけで対応言語を増やせます（翻訳は scripts/translate-locales.mjs）。
export const LANG_NAMES: Record<string, string> = {
  ja: '日本語',
  en: 'English',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  bn: 'বাংলা',
  pa: 'ਪੰਜਾਬੀ',
  te: 'తెలుగు',
  mr: 'मराठी',
  ta: 'தமிழ்',
  ur: 'اردو',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  tr: 'Türkçe',
  fa: 'فارسی',
  pl: 'Polski',
  uk: 'Українська',
  nl: 'Nederlands',
  ro: 'Română',
  el: 'Ελληνικά',
  cs: 'Čeština',
  hu: 'Magyar',
  sv: 'Svenska',
  da: 'Dansk',
  fi: 'Suomi',
  nb: 'Norsk',
  he: 'עברית',
  sw: 'Kiswahili',
  ha: 'Hausa',
  yo: 'Yorùbá',
  ig: 'Igbo',
  am: 'አማርኛ',
  zu: 'isiZulu',
  af: 'Afrikaans',
  ms: 'Bahasa Melayu',
  fil: 'Filipino',
  my: 'မြန်မာ',
  km: 'ខ្មែរ',
  lo: 'ລາວ',
  si: 'සිංහල',
  ne: 'नेपाली',
  km_kh: 'ខ្មែរ',
  bg: 'Български',
  sr: 'Српски',
  hr: 'Hrvatski',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  et: 'Eesti',
  ka: 'ქართული',
  hy: 'Հայերեն',
  az: 'Azərbaycan',
  kk: 'Қазақша',
  uz: 'Oʻzbekcha',
  mn: 'Монгол',
  is: 'Íslenska',
  ga: 'Gaeilge',
  sq: 'Shqip',
  mk: 'Македонски',
  ca: 'Català',
  eu: 'Euskara',
  gl: 'Galego',
  cy: 'Cymraeg',
};

// スイッチャーに出す言語 = 手動(ja/en/CHROME) ＋ 自動生成(GENERATED)。
export const LANGS: { code: string; label: string; dir?: 'rtl' }[] = (() => {
  const codes = ['ja', 'en', ...Object.keys(CHROME), ...Object.keys(GEN)];
  const seen = new Set<string>();
  const out: { code: string; label: string; dir?: 'rtl' }[] = [];
  for (const c of codes) {
    if (seen.has(c)) continue;
    seen.add(c);
    const label = LANG_NAMES[c] ?? c;
    out.push(RTL.has(baseOf(c)) ? { code: c, label, dir: 'rtl' } : { code: c, label });
  }
  return out;
})();

export const DEFAULT_LANG = 'ja';

export function getStrings(lang: string): Strings {
  if (lang === 'ja') return ja;
  if (lang === 'en') return en;
  const ov = CHROME[lang] ?? GEN[lang];
  if (!ov) return en;
  // 長文は en、上書きぶんは該当言語で
  return {
    ...en,
    ...ov,
    packs: { ...en.packs, ...(ov.packs ?? {}) },
    themes: { ...en.themes, ...(ov.themes ?? {}) },
    gokkoLabels: { ...en.gokkoLabels, ...(ov.gokkoLabels ?? {}) },
    gokkoBubbles: { ...en.gokkoBubbles, ...(ov.gokkoBubbles ?? {}) },
  };
}

export function isRtl(lang: string): boolean {
  return RTL.has(baseOf(lang));
}

// ブラウザの言語設定から対応言語を推定
export function detectLang(): string {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;
  const codes = LANGS.map((l) => l.code);
  for (const raw of navigator.languages ?? [navigator.language]) {
    if (!raw) continue;
    if (codes.includes(raw)) return raw;
    const lower = raw.toLowerCase();
    if (lower.startsWith('zh')) {
      if (/hant|tw|hk|mo/.test(lower)) return 'zh-Hant';
      return 'zh-Hans';
    }
    const base = lower.split('-')[0];
    const hit = codes.find((c) => c.split('-')[0] === base);
    if (hit) return hit;
  }
  return DEFAULT_LANG;
}

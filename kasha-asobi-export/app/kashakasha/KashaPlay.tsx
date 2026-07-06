'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  STRIPE_CHECKOUT_URL,
  CHECKOUT,
  PREMIUM_PRICE,
  TIER_STORAGE_KEY,
  PREMIUM_STORAGE_KEY,
} from './config';
import type { Strings, PackId, ThemeId } from './i18n';
import { tpl } from './i18n';
import { isNative, tierFromStore, restorePurchases } from './iap';

/* すべての音は Web Audio API でその場で合成。文言は props の t で多言語化。 */

type Puff = {
  id: number;
  x: number;
  y: number;
  color: string;
  glyph: string;
  rot: number;
  size: number;
  soft?: boolean;
};
type Spark = { id: number; x: number; y: number; color: string };
type Confetti = {
  id: number;
  x: number;
  y: number;
  color: string;
  dx: number;
  dy: number;
  rot: number;
  round: boolean;
};

const COLORS = [
  '#FF6B9D',
  '#FFD23F',
  '#4ECDC4',
  '#5B8DEF',
  '#FF8A47',
  '#9B6BFF',
  '#5FD35F',
  '#FF4D6D',
];
// 幾何グリフ（色は style で付与）＋ カラフル絵文字を混在
const GLYPHS = [
  '✦', '●', '◆', '★', '❤', '⬤', '✿', '▲', '☆', '◗',
  '🎈', '🫧', '🌸', '⭐', '🌈', '🍭', '🧸', '🌟', '💖', '🐣',
];

// テーマごとの背景装飾（ゆっくり漂う）
const THEME_DECOR: Record<ThemeId, string[]> = {
  pastel: ['🎈', '🌈', '⭐', '☁️', '🍬', '💗', '🎀', '🧸'],
  yozora: ['🌙', '⭐', '✨', '💫', '🌟', '🪐', '⭐', '✨'],
  umi: ['🐟', '🫧', '🐠', '🐚', '🌊', '⭐', '🐙', '🫧'],
  ohana: ['🌸', '🌼', '🌷', '🍀', '🦋', '🌻', '🌺', '🐝'],
  uchuu: ['🪐', '🚀', '⭐', '🌟', '👽', '🛸', '💫', '✨'],
  mori: ['🌳', '🍃', '🐛', '🍄', '🦋', '🐿️', '🌿', '🐞'],
  niji: ['🌈', '☁️', '⭐', '💫', '🎈', '✨', '🌟', '💗'],
  haru: ['🌸', '🌷', '🦋', '🐝', '🌱', '🌸', '🐤', '☘️'],
  natsu: ['🌻', '🍉', '🏖️', '🐠', '🎆', '☀️', '🌴', '🍧'],
  aki: ['🍁', '🍂', '🌰', '🍄', '🐿️', '🍎', '🎃', '🍇'],
  fuyu: ['❄️', '⛄', '🎄', '🧣', '🐧', '⭐', '🌨️', '🎁'],
};
// 装飾の配置（SSRと一致させるため固定）
const DECOR_POS = [
  { left: 10, top: 12, size: 34, delay: 0, twinkle: false },
  { left: 82, top: 10, size: 40, delay: 0.6, twinkle: true },
  { left: 24, top: 74, size: 30, delay: 1.1, twinkle: false },
  { left: 70, top: 66, size: 36, delay: 0.3, twinkle: true },
  { left: 45, top: 22, size: 26, delay: 0.9, twinkle: true },
  { left: 88, top: 82, size: 30, delay: 1.4, twinkle: false },
  { left: 6, top: 50, size: 32, delay: 0.5, twinkle: true },
  { left: 56, top: 86, size: 28, delay: 1.7, twinkle: false },
];

// 音パックの構成（ラベルは t.packs から）
// tier: 0=無料 1=スタンダード 2=プロ 3=マックス
const PACKS: { id: PackId; icon: string; tier: number }[] = [
  { id: 'kasha', icon: '🛍️', tier: 0 },
  { id: 'doubutsu', icon: '🐤', tier: 1 },
  { id: 'gakki', icon: '🎹', tier: 1 },
  { id: 'piano', icon: '🎼', tier: 1 },
  { id: 'taiko', icon: '🥁', tier: 1 },
  { id: 'mizu', icon: '💧', tier: 1 },
  { id: 'voice', icon: '🎤', tier: 2 },
];

// テーマの見た目（ラベルは t.themes から）。tier で開放段階を指定。
const THEME_CFG: Record<
  ThemeId,
  { icon: string; tier: number; bg: string; dark: boolean; hero: string }
> = {
  pastel: {
    icon: '🌈',
    tier: 0,
    bg: 'linear-gradient(135deg, #FFF1F6 0%, #FDF6E3 35%, #E8FBF6 70%, #EEF3FF 100%)',
    dark: false,
    hero: '🛍️✨',
  },
  yozora: {
    icon: '🌙',
    tier: 1,
    bg: 'linear-gradient(135deg, #1B1B4E 0%, #2D2B6B 45%, #0D1B3E 100%)',
    dark: true,
    hero: '🌙⭐',
  },
  umi: {
    icon: '🐟',
    tier: 1,
    bg: 'linear-gradient(135deg, #CDEFFF 0%, #A8E0F0 40%, #7FD4E8 75%, #B8F0E8 100%)',
    dark: false,
    hero: '🐟🫧',
  },
  ohana: {
    icon: '🌸',
    tier: 1,
    bg: 'linear-gradient(135deg, #FFE3F1 0%, #FFF0D9 40%, #FFE0E9 75%, #F3E8FF 100%)',
    dark: false,
    hero: '🌸🌼',
  },
  uchuu: {
    icon: '🚀',
    tier: 3,
    bg: 'linear-gradient(135deg, #0B0B2A 0%, #1A1A4E 40%, #3A2A6B 75%, #0D1B3E 100%)',
    dark: true,
    hero: '🚀🌌',
  },
  mori: {
    icon: '🌳',
    tier: 1,
    bg: 'linear-gradient(135deg, #DFF5E1 0%, #B8E6C0 40%, #8FD9A8 75%, #C8F0D8 100%)',
    dark: false,
    hero: '🌳🍃',
  },
  niji: {
    icon: '🌈',
    tier: 2,
    bg: 'linear-gradient(135deg, #FFE0EC 0%, #FFF0D9 28%, #E8FBE8 52%, #E0F0FF 76%, #F0E0FF 100%)',
    dark: false,
    hero: '🌈✨',
  },
  haru: {
    icon: '🌸',
    tier: 2,
    bg: 'linear-gradient(135deg, #FFE3EF 0%, #FFF0F5 35%, #E8F8E0 75%, #FDECF2 100%)',
    dark: false,
    hero: '🌸🦋',
  },
  natsu: {
    icon: '🌻',
    tier: 2,
    bg: 'linear-gradient(135deg, #CDEEFF 0%, #A8E0F0 40%, #FFF6C8 75%, #BEEFE6 100%)',
    dark: false,
    hero: '🌻🍉',
  },
  aki: {
    icon: '🍁',
    tier: 3,
    bg: 'linear-gradient(135deg, #FFE8CC 0%, #FFD9A8 40%, #F5C99B 75%, #FFE3C2 100%)',
    dark: false,
    hero: '🍁🌰',
  },
  fuyu: {
    icon: '⛄',
    tier: 3,
    bg: 'linear-gradient(135deg, #EAF4FF 0%, #DCEBFA 40%, #F0F6FF 75%, #E6F0FB 100%)',
    dark: false,
    hero: '⛄❄️',
  },
};

// おみせやさんごっこのステーション
// ごっこシーン（おみせ／どうぶつえん）
const GOKKO_SCENES: { id: string; stations: { id: string; emoji: string }[] }[] = [
  {
    id: 'shop',
    stations: [
      { id: 'bell', emoji: '🔔' },
      { id: 'cake', emoji: '🍰' },
      { id: 'register', emoji: '🧾' },
      { id: 'juice', emoji: '🥤' },
      { id: 'gift', emoji: '🎁' },
      { id: 'dog', emoji: '🐶' },
      { id: 'icecream', emoji: '🍦' },
      { id: 'balloon', emoji: '🎈' },
      { id: 'car', emoji: '🚗' },
    ],
  },
  {
    id: 'zoo',
    stations: [
      { id: 'lion', emoji: '🦁' },
      { id: 'elephant', emoji: '🐘' },
      { id: 'monkey', emoji: '🐵' },
      { id: 'bird', emoji: '🐦' },
      { id: 'frog', emoji: '🐸' },
      { id: 'cow', emoji: '🐄' },
      { id: 'cat', emoji: '🐱' },
      { id: 'sheep', emoji: '🐑' },
      { id: 'duck', emoji: '🦆' },
    ],
  },
  {
    id: 'ride',
    stations: [
      { id: 'densha', emoji: '🚃' },
      { id: 'hikouki', emoji: '✈️' },
      { id: 'fune', emoji: '⛵' },
      { id: 'bus', emoji: '🚌' },
      { id: 'kyukyu', emoji: '🚑' },
      { id: 'shoubou', emoji: '🚒' },
      { id: 'rocket', emoji: '🚀' },
      { id: 'jitensha', emoji: '🚲' },
      { id: 'heli', emoji: '🚁' },
    ],
  },
  {
    id: 'home',
    stations: [
      { id: 'door', emoji: '🚪' },
      { id: 'phone', emoji: '☎️' },
      { id: 'clock', emoji: '🕰️' },
      { id: 'tv', emoji: '📺' },
      { id: 'bath', emoji: '🛁' },
      { id: 'kettle', emoji: '🫖' },
      { id: 'light', emoji: '💡' },
      { id: 'rice', emoji: '🍚' },
      { id: 'bed', emoji: '🛏️' },
    ],
  },
];

// まなびモード：すうじ／ABC／いろ
const LEARN_SCENES: { id: string; items?: string[]; colors?: { id: string; hex: string }[] }[] = [
  { id: 'num', items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { id: 'abc', items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
  {
    id: 'iro',
    colors: [
      { id: 'aka', hex: '#FF4D5E' },
      { id: 'ao', hex: '#4C8DFF' },
      { id: 'kiiro', hex: '#FFD23F' },
      { id: 'midori', hex: '#57C84D' },
      { id: 'orange', hex: '#FF8A47' },
      { id: 'murasaki', hex: '#9B6BFF' },
      { id: 'pink', hex: '#FF6B9D' },
      { id: 'shiro', hex: '#FFFFFF' },
      { id: 'kuro', hex: '#3A3A3A' },
    ],
  },
];

// ごほうびシールのプール
const STICKERS = [
  '⭐', '🌈', '🎈', '🐰', '🌸', '🦄', '🍭', '🎀',
  '🐣', '🌟', '🧸', '🍀', '🐥', '🌻', '🎠', '🍩',
  '🦋', '🐳', '🚀', '👑', '🍦', '🎪', '🌙', '🏆',
];
const STICKER_STEP = 15; // 何タップで1枚

export default function KashaPlay({ t }: { t: Strings }) {
  const [started, setStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [wombOn, setWombOn] = useState(false);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [taps, setTaps] = useState(0);

  const [tier, setTier] = useState(0);
  const [native, setNative] = useState(false);
  const [pack, setPack] = useState<PackId>('kasha');
  const [theme, setTheme] = useState<ThemeId>('pastel');
  const [sleepMode, setSleepMode] = useState(false);
  const [timerMin, setTimerMin] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [paywall, setPaywall] = useState<{
    label: string;
    reqTier: number;
  } | null>(null);

  const [mode, setMode] = useState<'free' | 'gokko' | 'learn'>('free');
  const [gokkoScene, setGokkoScene] = useState('shop');
  const [learnScene, setLearnScene] = useState('num');
  const [bgmOn, setBgmOn] = useState(false);
  const [stickers, setStickers] = useState(0);
  const [reward, setReward] = useState(false);
  const [newSticker, setNewSticker] = useState(false);
  const bgmRef = useRef<{ stop: () => void } | null>(null);
  const stickerTapsRef = useRef(0);
  const newStickerTimer = useRef<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [holdPct, setHoldPct] = useState(0);
  const holdRef = useRef<number | null>(null);
  const bubbleTimer = useRef<number | null>(null);

  const audioRef = useRef<AudioContext | null>(null);
  const wombRef = useRef<{ src: AudioBufferSourceNode; gain: GainNode } | null>(null);
  const voiceBufRef = useRef<AudioBuffer | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const idRef = useRef(0);
  const lastMoveRef = useRef(0);

  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  const packRef = useRef(pack);
  packRef.current = pack;
  const sleepRef = useRef(sleepMode);
  sleepRef.current = sleepMode;

  const cfg = THEME_CFG[theme];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let lvl = 0;
    try {
      const stored = window.localStorage.getItem(TIER_STORAGE_KEY);
      if (stored) lvl = parseInt(stored, 10) || 0;
      else if (window.localStorage.getItem(PREMIUM_STORAGE_KEY) === '1') lvl = 1; // 旧互換
    } catch {
      /* noop */
    }
    const params = new URLSearchParams(window.location.search);
    const tp = params.get('tier');
    const legacy =
      params.get('premium') === '1' || params.get('premium') === 'success';
    if (tp || legacy) {
      const requested = tp ? parseInt(tp, 10) || 0 : 1;
      lvl = Math.max(lvl, Math.min(3, Math.max(0, requested)));
      try {
        window.localStorage.setItem(TIER_STORAGE_KEY, String(lvl));
      } catch {
        /* noop */
      }
      params.delete('tier');
      params.delete('premium');
      const clean =
        window.location.pathname + (params.toString() ? `?${params}` : '');
      window.history.replaceState(null, '', clean);
    }
    setTier(lvl);
  }, []);

  // ネイティブ（iOS/Android）：ストアの購入状態からティアを反映
  useEffect(() => {
    const nv = isNative();
    setNative(nv);
    if (!nv) return;
    tierFromStore()
      .then((store) => {
        if (store > 0) setTier((cur) => Math.max(cur, store));
      })
      .catch(() => {});
  }, []);

  const doRestore = async () => {
    try {
      const store = await restorePurchases();
      setTier((cur) => Math.max(cur, store));
    } catch {
      /* noop */
    }
  };

  // ごほうびシール：累計タップを保存し、STICKER_STEP ごとに1枚
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let n = 0;
    try {
      n = parseInt(window.localStorage.getItem('kasha_stickertaps_v1') || '0', 10) || 0;
    } catch {
      /* noop */
    }
    stickerTapsRef.current = n;
    setStickers(Math.min(STICKERS.length, Math.floor(n / STICKER_STEP)));
  }, []);

  const bumpProgress = useCallback(() => {
    stickerTapsRef.current += 1;
    try {
      window.localStorage.setItem('kasha_stickertaps_v1', String(stickerTapsRef.current));
    } catch {
      /* noop */
    }
    const earned = Math.min(
      STICKERS.length,
      Math.floor(stickerTapsRef.current / STICKER_STEP),
    );
    setStickers((cur) => {
      if (earned > cur) {
        setNewSticker(true);
        if (newStickerTimer.current) window.clearTimeout(newStickerTimer.current);
        newStickerTimer.current = window.setTimeout(() => setNewSticker(false), 2200);
      }
      return earned;
    });
  }, []);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audioRef.current = new Ctor();
    }
    if (audioRef.current.state === 'suspended') void audioRef.current.resume();
    return audioRef.current;
  }, []);

  const playCrinkle = useCallback(
    (intensity: number) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      const duration = 0.12 + Math.random() * 0.18;
      const length = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        let v = (Math.random() * 2 - 1) * 0.12;
        if (Math.random() < 0.055) v += (Math.random() * 2 - 1) * 0.95;
        data[i] = v * Math.pow(1 - i / length, 1.4);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2800 + Math.random() * 3200;
      bp.Q.value = 0.6;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1400;
      const g = ctx.createGain();
      g.gain.value = Math.min(0.6, 0.42 * intensity);
      src.connect(bp);
      bp.connect(hp);
      hp.connect(g);
      g.connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + duration + 0.02);
    },
    [ensureCtx],
  );

  const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  const playMarimba = useCallback(
    (intensity: number) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const f = NOTES[Math.floor(Math.random() * NOTES.length)];
      [
        { type: 'triangle' as OscillatorType, mul: 1, gain: 0.5, dur: 0.8 },
        { type: 'sine' as OscillatorType, mul: 2, gain: 0.18, dur: 0.5 },
      ].forEach((v) => {
        const osc = ctx.createOscillator();
        osc.type = v.type;
        osc.frequency.value = f * v.mul;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(v.gain * intensity, now + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, now + v.dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + v.dur + 0.02);
      });
    },
    [ensureCtx],
  );

  const playTaiko = useCallback(
    (intensity: number) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9 * intensity, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      const nlen = Math.floor(ctx.sampleRate * 0.05);
      const nb = ctx.createBuffer(1, nlen, ctx.sampleRate);
      const nd = nb.getChannelData(0);
      for (let i = 0; i < nlen; i++)
        nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nlen, 2);
      const nsrc = ctx.createBufferSource();
      nsrc.buffer = nb;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1200;
      const ng = ctx.createGain();
      ng.gain.value = 0.5 * intensity;
      nsrc.connect(lp);
      lp.connect(ng);
      ng.connect(ctx.destination);
      nsrc.start(now);
    },
    [ensureCtx],
  );

  const playCreature = useCallback(
    (intensity: number) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const base = 380 + Math.random() * 520;
      const up = Math.random() > 0.5;
      const osc = ctx.createOscillator();
      osc.type = Math.random() > 0.5 ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(
        up ? base * 1.7 : base * 0.6,
        now + 0.18,
      );
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 18;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 25;
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.35 * intensity, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.3);
      lfo.stop(now + 0.3);
    },
    [ensureCtx],
  );

  const playVoice = useCallback(
    (intensity: number) => {
      const ctx = ensureCtx();
      const buf = voiceBufRef.current;
      if (!ctx || !buf) {
        playCrinkle(intensity);
        return;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = 0.92 + Math.random() * 0.18;
      const g = ctx.createGain();
      g.gain.value = Math.min(1, 1.1 * intensity);
      src.connect(g);
      g.connect(ctx.destination);
      src.start();
    },
    [ensureCtx, playCrinkle],
  );

  // おみせやさんごっこ：ステーションごとの音
  const tone = useCallback(
    (
      freqs: number[],
      type: OscillatorType = 'triangle',
      step = 0.11,
      dur = 0.32,
    ) => {
      const ctx = ensureCtx();
      if (!ctx || !soundOnRef.current) return;
      const now = ctx.currentTime;
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = f;
        const g = ctx.createGain();
        const at = now + i * step;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.4, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      });
    },
    [ensureCtx],
  );

  const playGokko = useCallback(
    (kind: string) => {
      switch (kind) {
        case 'bell':
          return tone([880, 1174.7], 'sine', 0.14, 0.5);
        case 'cake':
          return tone([659.25, 783.99, 987.77], 'triangle', 0.09, 0.4);
        case 'register':
          return tone([1318.5, 1046.5], 'square', 0.08, 0.18);
        case 'juice':
          return tone([1200, 1500, 1000, 1600], 'sine', 0.06, 0.12);
        case 'gift':
          return tone([523.25, 659.25, 783.99, 1046.5], 'triangle', 0.08, 0.45);
        case 'dog':
          return playCreature(1);
        case 'icecream':
          return tone([1046.5, 1318.5, 1568], 'sine', 0.07, 0.3);
        case 'balloon':
          return tone([700, 1400], 'triangle', 0.05, 0.14);
        case 'car':
          return tone([330, 262], 'sawtooth', 0.12, 0.3);
        // どうぶつえん
        case 'lion':
          return tone([170, 130, 150], 'sawtooth', 0.12, 0.4);
        case 'elephant':
          return tone([90, 150, 90], 'sine', 0.14, 0.5);
        case 'monkey':
          return playCreature(1);
        case 'bird':
          return tone([2100, 2600, 2200], 'sine', 0.05, 0.1);
        case 'frog':
          return tone([300, 220, 300, 220], 'square', 0.06, 0.1);
        case 'cow':
          return tone([160, 120], 'sawtooth', 0.18, 0.5);
        case 'cat':
          return tone([760, 900, 620], 'triangle', 0.08, 0.22);
        case 'sheep':
          return tone([440, 400, 440], 'sawtooth', 0.08, 0.2);
        case 'duck':
          return tone([520, 400, 520, 400], 'square', 0.05, 0.08);
        // のりもの
        case 'densha':
          return tone([200, 180, 200, 180], 'sawtooth', 0.09, 0.14);
        case 'hikouki':
          return tone([360, 520], 'sawtooth', 0.2, 0.5);
        case 'fune':
          return tone([120, 90], 'sine', 0.2, 0.6);
        case 'bus':
          return tone([170, 140], 'sawtooth', 0.14, 0.4);
        case 'kyukyu':
          return tone([880, 660, 880, 660], 'sine', 0.14, 0.28);
        case 'shoubou':
          return tone([700, 500, 700, 500], 'square', 0.12, 0.24);
        case 'rocket':
          return tone([90, 200, 420], 'sawtooth', 0.14, 0.5);
        case 'jitensha':
          return tone([1600, 1600], 'sine', 0.12, 0.12);
        case 'heli':
          return tone([120, 150, 120, 150, 120], 'square', 0.05, 0.08);
        // おうち
        case 'door':
          return tone([200, 150], 'square', 0.09, 0.12);
        case 'phone':
          return tone([1100, 900, 1100, 900], 'sine', 0.09, 0.2);
        case 'clock':
          return tone([1000, 800], 'sine', 0.16, 0.14);
        case 'tv':
          return tone([523, 659, 784, 1046], 'square', 0.06, 0.14);
        case 'bath':
          return tone([600, 420, 620], 'sine', 0.09, 0.24);
        case 'kettle':
          return tone([1500, 1500], 'sine', 0.2, 0.5);
        case 'light':
          return tone([1700], 'sine', 0, 0.08);
        case 'rice':
          return tone([320, 420, 320], 'triangle', 0.09, 0.2);
        case 'bed':
          return tone([200, 150], 'sine', 0.2, 0.6);
        default:
          return tone([700], 'triangle');
      }
    },
    [tone, playCreature],
  );

  // ピアノ：やわらかい持続音（ペンタトニック）
  const playPiano = useCallback(
    (intensity: number) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const f = NOTES[Math.floor(Math.random() * NOTES.length)];
      [
        { type: 'sine' as OscillatorType, mul: 1, gain: 0.5, dur: 1.3 },
        { type: 'triangle' as OscillatorType, mul: 1, gain: 0.22, dur: 1.0 },
        { type: 'sine' as OscillatorType, mul: 2.01, gain: 0.12, dur: 0.7 },
      ].forEach((v) => {
        const osc = ctx.createOscillator();
        osc.type = v.type;
        osc.frequency.value = f * v.mul;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(v.gain * intensity, now + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + v.dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + v.dur + 0.02);
      });
    },
    [ensureCtx],
  );

  // みずおと：ポチャン（高音のピッチ落ち）
  const playMizu = useCallback(
    (intensity: number) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const top = 1300 + Math.random() * 900;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(top, now);
      osc.frequency.exponentialRampToValueAtTime(top * 0.45, now + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.5 * intensity, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    },
    [ensureCtx],
  );

  const playSound = useCallback(
    (intensity: number) => {
      if (!soundOnRef.current) return;
      const p = sleepRef.current ? 'kasha' : packRef.current;
      const amp = sleepRef.current ? intensity * 0.4 : intensity;
      switch (p) {
        case 'gakki':
          return playMarimba(amp);
        case 'piano':
          return playPiano(amp);
        case 'taiko':
          return playTaiko(amp);
        case 'mizu':
          return playMizu(amp);
        case 'doubutsu':
          return playCreature(amp);
        case 'voice':
          return playVoice(amp);
        default:
          return playCrinkle(amp);
      }
    },
    [playCrinkle, playMarimba, playPiano, playTaiko, playMizu, playCreature, playVoice],
  );

  const startWomb = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx || wombRef.current) return;
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.5);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 1.0;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.05;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    lfo.start();
    src.connect(lp);
    lp.connect(g);
    g.connect(ctx.destination);
    src.start();
    wombRef.current = { src, gain: g };
  }, [ensureCtx]);

  const stopWomb = useCallback(() => {
    const w = wombRef.current;
    const ctx = audioRef.current;
    if (!w || !ctx) return;
    w.gain.gain.cancelScheduledValues(ctx.currentTime);
    w.gain.gain.setValueAtTime(w.gain.gain.value, ctx.currentTime);
    w.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    try {
      w.src.stop(ctx.currentTime + 0.7);
    } catch {
      /* noop */
    }
    wombRef.current = null;
  }, []);

  // こもりうた（きらきら星のやさしいループ）
  const startBgm = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx || bgmRef.current) return;
    const C = 261.63, D = 293.66, E = 329.63, F = 349.23, G = 392.0, A = 440.0;
    const MEL: [number, number][] = [
      [C, 1], [C, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2],
      [F, 1], [F, 1], [E, 1], [E, 1], [D, 1], [D, 1], [C, 2],
      [G, 1], [G, 1], [F, 1], [F, 1], [E, 1], [E, 1], [D, 2],
      [G, 1], [G, 1], [F, 1], [F, 1], [E, 1], [E, 1], [D, 2],
    ];
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);
    master.connect(ctx.destination);
    let i = 0;
    let stopped = false;
    let timer = 0;
    const beatMs = 460;
    const playNote = () => {
      if (stopped) return;
      const [f, beats] = MEL[i % MEL.length];
      const now = ctx.currentTime;
      [
        { type: 'sine' as OscillatorType, g: 0.6 },
        { type: 'triangle' as OscillatorType, g: 0.18 },
      ].forEach((v) => {
        const o = ctx.createOscillator();
        o.type = v.type;
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(v.g, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + beats * 0.46);
        o.connect(g);
        g.connect(master);
        o.start(now);
        o.stop(now + beats * 0.5);
      });
      i++;
      timer = window.setTimeout(playNote, beats * beatMs);
    };
    timer = window.setTimeout(playNote, 120);
    bgmRef.current = {
      stop: () => {
        stopped = true;
        window.clearTimeout(timer);
        try {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        } catch {
          /* noop */
        }
      },
    };
  }, [ensureCtx]);

  const stopBgm = useCallback(() => {
    bgmRef.current?.stop();
    bgmRef.current = null;
  }, []);

  useEffect(() => {
    if (!started) return;
    if (wombOn || sleepMode) startWomb();
    else stopWomb();
  }, [wombOn, sleepMode, started, startWomb, stopWomb]);

  useEffect(() => {
    if (!started) return;
    if (bgmOn) startBgm();
    else stopBgm();
  }, [bgmOn, started, startBgm, stopBgm]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (started && timerMin > 0 && !timeUp) {
      timerRef.current = window.setTimeout(
        () => {
          setTimeUp(true);
          stopWomb();
        },
        timerMin * 60 * 1000,
      );
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [started, timerMin, timeUp, stopWomb]);

  const startRecording = useCallback(async () => {
    const ctx = ensureCtx();
    if (!ctx || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      alert('🎤 ✕');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        try {
          const blob = new Blob(chunks);
          const arr = await blob.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr);
          voiceBufRef.current = buf;
          setHasRecording(true);
          setPack('voice');
        } catch {
          /* decode 失敗 */
        }
        setIsRecording(false);
      };
      rec.start();
      recRef.current = rec;
      setIsRecording(true);
      window.setTimeout(() => {
        if (recRef.current && recRef.current.state !== 'inactive')
          recRef.current.stop();
      }, 3000);
    } catch {
      setIsRecording(false);
    }
  }, [ensureCtx]);

  const burst = useCallback(
    (clientX: number, clientY: number, rect: DOMRect, intensity: number) => {
      if (timeUp) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      try {
        playSound(intensity);
      } catch {
        /* 音の失敗で演出は止めない */
      }
      const soft = sleepRef.current;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const id = idRef.current++;
      setPuffs((prev) => [
        ...prev.slice(-28),
        {
          id,
          x,
          y,
          color: soft ? '#FFFFFF' : color,
          glyph: soft ? '·' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          rot: Math.random() * 60 - 30,
          size: soft ? 40 : 56 + Math.random() * 64,
          soft,
        },
      ]);
      const newSparks: Spark[] = [];
      const n = soft ? 2 : 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        newSparks.push({
          id: idRef.current++,
          x: x + (Math.random() * 90 - 45),
          y: y + (Math.random() * 90 - 45),
          color: soft ? '#FFFFFFAA' : COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
      setSparks((prev) => [...prev.slice(-40), ...newSparks]);

      // 紙吹雪（おやすみモード以外）
      let confIds: Set<number> | null = null;
      if (!soft) {
        const newConf: Confetti[] = [];
        const cn = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < cn; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 80;
          newConf.push({
            id: idRef.current++,
            x,
            y,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            dx: Math.cos(ang) * dist,
            dy: Math.sin(ang) * dist + 40,
            rot: Math.random() * 360,
            round: Math.random() > 0.5,
          });
        }
        confIds = new Set(newConf.map((c) => c.id));
        setConfetti((prev) => [...prev.slice(-60), ...newConf]);
      }

      setTaps((c) => c + 1);
      bumpProgress();
      window.setTimeout(() => {
        setPuffs((prev) => prev.filter((p) => p.id !== id));
      }, 900);
      const sparkIds = new Set(newSparks.map((s) => s.id));
      window.setTimeout(() => {
        setSparks((prev) => prev.filter((s) => !sparkIds.has(s.id)));
        if (confIds) setConfetti((prev) => prev.filter((c) => !confIds.has(c.id)));
      }, 1000);
    },
    [playSound, timeUp],
  );

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    burst(e.clientX, e.clientY, rect, 1);
  };
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    const now = e.timeStamp;
    if (now - lastMoveRef.current < 90) return;
    lastMoveRef.current = now;
    const rect = e.currentTarget.getBoundingClientRect();
    burst(e.clientX, e.clientY, rect, 0.7);
  };

  const start = () => {
    ensureCtx();
    playCrinkle(0.8);
    setStarted(true);
  };
  const restart = () => {
    setTimeUp(false);
    setTaps(0);
  };

  // おみせやさんごっこ：ステーションをタッチ
  // ボタン共通の演出（吹き出し＋キラキラ）
  const buttonEffect = (
    e: React.PointerEvent<HTMLButtonElement>,
    bubbleText: string,
  ) => {
    setBubble(bubbleText);
    setTaps((c) => c + 1);
    bumpProgress();
    const rect = e.currentTarget.getBoundingClientRect();
    const parent = e.currentTarget.closest('[role=application]');
    const prect = parent?.getBoundingClientRect();
    if (prect) {
      const cx = rect.left - prect.left + rect.width / 2;
      const cy = rect.top - prect.top + rect.height / 2;
      const newSparks: Spark[] = [];
      for (let i = 0; i < 5; i++) {
        newSparks.push({
          id: idRef.current++,
          x: cx + (Math.random() * 100 - 50),
          y: cy + (Math.random() * 100 - 50),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
      setSparks((prev) => [...prev.slice(-40), ...newSparks]);
      const ids = new Set(newSparks.map((s) => s.id));
      window.setTimeout(
        () => setSparks((prev) => prev.filter((s) => !ids.has(s.id))),
        850,
      );
    }
    if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 1600);
  };

  const tapStation = (
    e: React.PointerEvent<HTMLButtonElement>,
    id: string,
  ) => {
    e.stopPropagation();
    try {
      playGokko(id);
    } catch {
      /* noop */
    }
    buttonEffect(e, t.gokkoBubbles[id] ?? '');
  };

  const tapLearn = (
    e: React.PointerEvent<HTMLButtonElement>,
    char: string,
    index: number,
  ) => {
    e.stopPropagation();
    try {
      if (soundOnRef.current) {
        const f = 392 * Math.pow(2, (index % 12) / 12);
        tone([f], 'triangle', 0, 0.6);
      }
    } catch {
      /* noop */
    }
    buttonEffect(e, char);
  };

  // 誤操作防止ロックの解除（長押し）
  const startUnlock = () => {
    const began = performance.now();
    const tick = () => {
      const pct = Math.min(1, (performance.now() - began) / 1200);
      setHoldPct(pct);
      if (pct >= 1) {
        setLocked(false);
        setHoldPct(0);
        holdRef.current = null;
        return;
      }
      holdRef.current = window.requestAnimationFrame(tick);
    };
    holdRef.current = window.requestAnimationFrame(tick);
  };
  const cancelUnlock = () => {
    if (holdRef.current) window.cancelAnimationFrame(holdRef.current);
    holdRef.current = null;
    setHoldPct(0);
  };

  useEffect(() => {
    return () => {
      stopWomb();
      stopBgm();
      if (recRef.current && recRef.current.state !== 'inactive')
        recRef.current.stop();
      if (holdRef.current) window.cancelAnimationFrame(holdRef.current);
      if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
      if (newStickerTimer.current) window.clearTimeout(newStickerTimer.current);
      audioRef.current?.close().catch(() => {});
    };
  }, [stopWomb, stopBgm]);

  const choosePack = (p: (typeof PACKS)[number]) => {
    if (p.tier > tier) {
      setPaywall({ label: t.packs[p.id] + t.packWord, reqTier: p.tier });
      return;
    }
    if (p.id === 'voice' && !hasRecording) {
      void startRecording();
      return;
    }
    setPack(p.id);
  };
  const chooseTheme = (id: ThemeId) => {
    const req = THEME_CFG[id].tier;
    if (req > tier) {
      setPaywall({ label: t.themes[id] + t.themeWord, reqTier: req });
      return;
    }
    setTheme(id);
  };

  // ペイウォールで案内するプラン（必要ティアに対応）
  const planForTier = (req: number) =>
    t.plans.find((p) => p.tier === req) ?? t.plans[0];

  const btn = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-bold transition-colors ${
      active ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`;

  return (
    <div className="mx-auto max-w-3xl px-4">
      <div
        data-shot="stage"
        className="relative overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5"
      >
        <div
          onPointerDown={started ? handleDown : undefined}
          onPointerMove={started ? handleMove : undefined}
          className="kasha-shimmer relative h-[68vh] min-h-[420px] w-full touch-none select-none"
          style={{ background: cfg.bg, cursor: started ? 'pointer' : 'default' }}
          role="application"
          aria-label={t.heroTitle}
        >
          {/* やわらかい背景ドット */}
          {started && !timeUp && (
            <div className="pointer-events-none absolute inset-0 opacity-30">
              {BG_DOTS.map((d, i) => (
                <span
                  key={i}
                  className="kasha-breathe absolute rounded-full"
                  style={{
                    left: `${d.left}%`,
                    top: `${d.top}%`,
                    width: d.size,
                    height: d.size,
                    background: d.color,
                    animationDelay: `${d.delay}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* テーマ装飾（漂う絵文字）*/}
          {started && !timeUp && mode === 'free' && (
            <div className="pointer-events-none absolute inset-0">
              {DECOR_POS.map((d, i) => (
                <span
                  key={i}
                  className={`absolute ${d.twinkle ? 'kasha-twinkle' : 'kasha-drift'}`}
                  style={{
                    left: `${d.left}%`,
                    top: `${d.top}%`,
                    fontSize: d.size,
                    animationDelay: `${d.delay}s`,
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))',
                  }}
                >
                  {THEME_DECOR[theme][i % THEME_DECOR[theme].length]}
                </span>
              ))}
            </div>
          )}

          {/* 紙吹雪 */}
          {confetti.map((c) => (
            <span
              key={c.id}
              className="kasha-confetti pointer-events-none absolute"
              style={
                {
                  left: c.x,
                  top: c.y,
                  width: 16,
                  height: 16,
                  background: c.color,
                  borderRadius: c.round ? '50%' : '3px',
                  ['--dx']: `${c.dx}px`,
                  ['--dy']: `${c.dy}px`,
                  ['--cr']: `${c.rot}deg`,
                } as React.CSSProperties
              }
            />
          ))}

          {/* マスコット */}
          {started && !timeUp && (
            <div
              className="kasha-hop pointer-events-none absolute bottom-3 left-3 text-4xl"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))' }}
            >
              🐰
            </div>
          )}

          {/* おみせやさんごっこ */}
          {started && mode === 'gokko' && !timeUp && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
              {/* シーン切替（おみせ／どうぶつえん）*/}
              <div className="flex gap-2">
                {GOKKO_SCENES.map((sc) => {
                  const active = gokkoScene === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setGokkoScene(sc.id);
                      }}
                      className={`rounded-full px-4 py-1.5 text-sm font-black shadow transition-colors ${
                        active ? 'bg-[#FF6B9D] text-white' : 'bg-white/85 text-[#1B2A5C]'
                      }`}
                    >
                      {t.gokkoScenes[sc.id]}
                    </button>
                  );
                })}
              </div>
              <p
                className={`text-xs font-bold ${
                  cfg.dark ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {t.gokkoHint}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(
                  GOKKO_SCENES.find((sc) => sc.id === gokkoScene) ?? GOKKO_SCENES[0]
                ).stations.map((s) => (
                  <button
                    key={s.id}
                    onPointerDown={(e) => tapStation(e, s.id)}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-3xl bg-white/85 shadow-lg backdrop-blur transition-transform hover:scale-105 active:scale-90"
                    aria-label={t.gokkoLabels[s.id]}
                  >
                    <span className="text-4xl">{s.emoji}</span>
                    <span className="text-[11px] font-black text-[#1B2A5C]">
                      {t.gokkoLabels[s.id]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* まなびモード（すうじ／ABC）*/}
          {started && mode === 'learn' && !timeUp && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
              <div className="flex gap-2">
                {LEARN_SCENES.map((sc) => {
                  const active = learnScene === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setLearnScene(sc.id);
                      }}
                      className={`rounded-full px-4 py-1.5 text-sm font-black shadow transition-colors ${
                        active ? 'bg-[#FF6B9D] text-white' : 'bg-white/85 text-[#1B2A5C]'
                      }`}
                    >
                      {t.learnScenes[sc.id]}
                    </button>
                  );
                })}
              </div>
              <p
                className={`text-xs font-bold ${
                  cfg.dark ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {t.learnHint}
              </p>
              {learnScene === 'iro' ? (
                <div className="grid grid-cols-3 gap-3">
                  {(LEARN_SCENES.find((sc) => sc.id === 'iro')?.colors ?? []).map(
                    (c, i) => (
                      <button
                        key={c.id}
                        onPointerDown={(e) => tapLearn(e, t.colorNames[c.id] ?? c.id, i)}
                        className="h-20 w-20 rounded-full shadow-md ring-2 ring-white transition-transform hover:scale-105 active:scale-90"
                        style={{ backgroundColor: c.hex }}
                        aria-label={t.colorNames[c.id] ?? c.id}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div
                  className={`grid gap-2.5 ${
                    learnScene === 'num' ? 'grid-cols-3' : 'grid-cols-5'
                  }`}
                >
                  {(
                    LEARN_SCENES.find((sc) => sc.id === learnScene)?.items ?? []
                  ).map((ch, i) => (
                    <button
                      key={ch}
                      onPointerDown={(e) => tapLearn(e, ch, i)}
                      className={`flex items-center justify-center rounded-2xl bg-white/90 font-black text-[#1B2A5C] shadow-md transition-transform hover:scale-105 active:scale-90 ${
                        learnScene === 'num'
                          ? 'h-20 w-20 text-4xl'
                          : 'h-14 w-14 text-2xl'
                      }`}
                      aria-label={ch}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* セリフ吹き出し */}
          {bubble && (
            <div className="kasha-pop pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2">
              <span className="inline-block rounded-full bg-white px-6 py-3 text-lg font-black text-[#FF6B9D] shadow-xl">
                {bubble}
              </span>
            </div>
          )}

          {/* ごほうびシール獲得の演出 */}
          {newSticker && (
            <div className="kasha-pop pointer-events-none absolute left-1/2 top-1/3 z-20 -translate-x-1/2 text-center">
              <div className="text-6xl">{STICKERS[Math.min(STICKERS.length - 1, stickers - 1)]}</div>
              <span className="mt-2 inline-block rounded-full bg-[#C9A050] px-5 py-2 text-sm font-black text-white shadow-lg">
                {t.rewardNew}
              </span>
            </div>
          )}

          {!started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
              <div className="kasha-wiggle text-6xl">{cfg.hero}</div>
              <div>
                <p
                  className={`text-2xl font-black ${
                    cfg.dark ? 'text-white' : 'text-[#1B2A5C]'
                  }`}
                >
                  {t.heroTitle}
                </p>
                <p
                  className={`mt-2 text-sm ${
                    cfg.dark ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {t.startHint}
                </p>
              </div>
              <button
                onClick={start}
                className="rounded-full bg-[#FF6B9D] px-10 py-4 text-lg font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {t.start}
              </button>
              <p
                className={`max-w-xs text-xs ${
                  cfg.dark ? 'text-white/50' : 'text-gray-400'
                }`}
              >
                {t.startCaption}
              </p>
            </div>
          )}

          {sparks.map((s) => (
            <span
              key={s.id}
              className="kasha-sparkle pointer-events-none absolute text-lg"
              style={{ left: s.x, top: s.y, color: s.color }}
            >
              ✦
            </span>
          ))}

          {puffs.map((p) => (
            <span
              key={p.id}
              className="kasha-pop pointer-events-none absolute flex items-center justify-center font-black"
              style={
                {
                  left: p.x,
                  top: p.y,
                  color: p.color,
                  fontSize: p.size,
                  textShadow: p.soft
                    ? '0 0 24px #FFFFFFAA'
                    : `0 0 18px ${p.color}88, 0 2px 6px rgba(0,0,0,0.15)`,
                  ['--kasha-rot']: `${p.rot}deg`,
                } as React.CSSProperties
              }
            >
              {p.glyph}
            </span>
          ))}

          {started && !timeUp && (
            <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end gap-1.5">
              {taps > 0 && (
                <span className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-black text-[#FF6B9D] shadow-sm backdrop-blur">
                  {tpl(t.counter, { n: taps })}
                </span>
              )}
              {tier > 0 && (
                <span className="rounded-full bg-[#C9A050] px-3 py-1 text-[11px] font-black text-white shadow-sm">
                  ✨ {t.tierNames[tier]}
                </span>
              )}
              {sleepMode && (
                <span className="rounded-full bg-[#9B6BFF] px-3 py-1 text-[11px] font-black text-white shadow-sm">
                  {t.sleepTag}
                </span>
              )}
            </div>
          )}

          {timeUp && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/55 px-6 text-center backdrop-blur-sm">
              <div className="text-6xl">😴</div>
              <div>
                <p className="text-2xl font-black text-white">{t.timeUpTitle}</p>
                <p className="mt-2 text-sm text-white/70">
                  {tpl(t.timeUpSub, { m: timerMin })}
                </p>
              </div>
              <button
                onClick={restart}
                className="rounded-full bg-[#FF6B9D] px-8 py-3 font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {t.again}
              </button>
            </div>
          )}
        </div>

        {/* ロック中バー */}
        {started && locked && (
          <div className="flex flex-col items-center gap-3 bg-white px-4 py-6">
            <p className="text-sm font-black text-[#1B2A5C]">{t.lockedTitle}</p>
            <button
              onPointerDown={startUnlock}
              onPointerUp={cancelUnlock}
              onPointerLeave={cancelUnlock}
              className="relative overflow-hidden rounded-full bg-[#5B4B8A] px-8 py-3 text-sm font-black text-white shadow"
            >
              <span
                className="absolute inset-y-0 left-0 bg-white/25"
                style={{ width: `${holdPct * 100}%` }}
              />
              <span className="relative">
                {holdPct > 0 ? t.lockHold : t.unlockHint}
              </span>
            </button>
          </div>
        )}

        {started && !locked && (
          <div className="space-y-4 bg-white px-4 py-5">
            {/* モード切替・ロック */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setMode('free')}
                className={btn(mode === 'free')}
                style={mode === 'free' ? { backgroundColor: '#FF6B9D' } : undefined}
                aria-pressed={mode === 'free'}
              >
                {t.modeFree}
              </button>
              <button
                onClick={() => setMode('gokko')}
                className={btn(mode === 'gokko')}
                style={mode === 'gokko' ? { backgroundColor: '#FF6B9D' } : undefined}
                aria-pressed={mode === 'gokko'}
              >
                {t.modeGokko}
              </button>
              <button
                onClick={() => setMode('learn')}
                className={btn(mode === 'learn')}
                style={mode === 'learn' ? { backgroundColor: '#FF6B9D' } : undefined}
                aria-pressed={mode === 'learn'}
              >
                {t.modeLearn}
              </button>
              <button
                onClick={() => setLocked(true)}
                className="rounded-full bg-[#5B4B8A] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#4A3D73]"
              >
                {t.lock}
              </button>
            </div>

            {/* 音パック */}
            <div>
              <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t.packLabel}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {PACKS.map((p) => {
                  const locked = p.tier > tier;
                  const active = pack === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => choosePack(p)}
                      className={btn(active)}
                      style={active ? { backgroundColor: '#FF6B9D' } : undefined}
                      aria-pressed={active}
                    >
                      {p.icon} {t.packs[p.id]}
                      {locked ? ' 🔒' : ''}
                      {p.id === 'voice' && hasRecording ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>
              {pack === 'voice' && (
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  {hasRecording ? t.voiceHintDone : t.voiceHintRec}
                  {tier >= 2 && (
                    <button
                      onClick={() => void startRecording()}
                      disabled={isRecording}
                      className="ml-2 font-bold text-[#FF6B9D] disabled:opacity-40"
                    >
                      {isRecording ? t.recording : t.recRetake}
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* きせかえ */}
            <div>
              <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {t.themeLabel}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(Object.keys(THEME_CFG) as ThemeId[]).map((id) => {
                  const c = THEME_CFG[id];
                  const locked = c.tier > tier;
                  const active = theme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => chooseTheme(id)}
                      className={btn(active)}
                      style={active ? { backgroundColor: '#9B6BFF' } : undefined}
                      aria-pressed={active}
                    >
                      {c.icon} {t.themes[id]}
                      {locked ? ' 🔒' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* トグル・タイマー */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSoundOn((v) => !v)}
                className={btn(soundOn)}
                style={soundOn ? { backgroundColor: '#4ECDC4' } : undefined}
                aria-pressed={soundOn}
              >
                {soundOn ? t.soundOn : t.soundOff}
              </button>
              <button
                onClick={() => setWombOn((v) => !v)}
                className={btn(wombOn)}
                style={wombOn ? { backgroundColor: '#9B6BFF' } : undefined}
                aria-pressed={wombOn}
              >
                {wombOn ? t.wombOn : t.wombOff}
              </button>
              <button
                onClick={() => {
                  if (tier < 2) {
                    setPaywall({ label: t.sleepName, reqTier: 2 });
                    return;
                  }
                  setSleepMode((v) => !v);
                }}
                className={btn(sleepMode)}
                style={sleepMode ? { backgroundColor: '#5B4B8A' } : undefined}
                aria-pressed={sleepMode}
              >
                {t.sleep}
                {tier >= 2 ? '' : ' 🔒'}
              </button>
              <label className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm font-bold text-gray-500">
                ⏰
                <select
                  value={timerMin}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v > 0 && tier < 2) {
                      setPaywall({ label: t.timerName, reqTier: 2 });
                      return;
                    }
                    setTimeUp(false);
                    setTimerMin(v);
                  }}
                  className="bg-transparent outline-none"
                  aria-label={t.timerName}
                >
                  <option value={0}>
                    {t.timerNone}
                    {tier >= 2 ? '' : ' 🔒'}
                  </option>
                  <option value={5}>{t.timer5}</option>
                  <option value={10}>{t.timer10}</option>
                  <option value={15}>{t.timer15}</option>
                </select>
              </label>
              <button
                onClick={() => setBgmOn((v) => !v)}
                className={btn(bgmOn)}
                style={bgmOn ? { backgroundColor: '#5FD35F' } : undefined}
                aria-pressed={bgmOn}
              >
                {bgmOn ? t.bgmOn : t.bgmOff}
              </button>
              <button
                onClick={() => setReward(true)}
                className="rounded-full bg-[#FFF3D6] px-4 py-2 text-sm font-bold text-[#B8860B] transition-colors hover:bg-[#FFE9B8]"
              >
                {t.rewardBtn} {stickers}/{STICKERS.length}
              </button>
              <button
                onClick={() => {
                  setPuffs([]);
                  setSparks([]);
                  setTaps(0);
                }}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
              >
                {t.cleanup}
              </button>
              {native && (
                <button
                  onClick={doRestore}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
                >
                  {t.restore}
                </button>
              )}
            </div>

            {tier < 3 && (
              <div className="rounded-2xl bg-gradient-to-r from-[#FFF1F6] to-[#F3E8FF] p-4 text-center">
                <p className="text-sm font-black text-[#1B2A5C]">{t.bannerTitle}</p>
                <p className="mt-1 text-[11px] text-gray-500">{t.bannerSub}</p>
                <a
                  href={STRIPE_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-full bg-[#C9A050] px-6 py-2.5 text-sm font-black text-white shadow transition-colors hover:bg-[#B8903F]"
                >
                  {tpl(t.unlockPrice, { price: PREMIUM_PRICE })}
                </a>
                <p className="mt-1.5 text-[10px] text-gray-400">{t.priceNote}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {started && (
        <p className="mt-4 text-center text-xs text-gray-400">{t.wombFootnote}</p>
      )}

      {paywall &&
        (() => {
          const plan = planForTier(paywall.reqTier);
          const href = CHECKOUT[plan.id] ?? STRIPE_CHECKOUT_URL;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setPaywall(null)}
            >
              <div
                className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-5xl">✨</div>
                <h3 className="mt-3 text-lg font-black text-[#1B2A5C]">
                  {t.paywallTitle}
                </h3>
                <span className="mt-2 inline-block rounded-full bg-pink-50 px-3 py-1 text-sm font-bold text-[#FF6B9D]">
                  {paywall.label}
                </span>
                <p className="mt-3 text-sm font-bold text-[#C9A050]">
                  {tpl(t.unlockWith, { plan: t.tierNames[paywall.reqTier] })}
                </p>
                <ul className="mt-4 space-y-1.5 text-left">
                  {plan.unlocks.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-[#C9A050]">✔</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="mt-5 block rounded-full bg-[#C9A050] px-6 py-3 text-base font-black text-white shadow transition-colors hover:bg-[#B8903F]"
                >
                  {plan.cta} · {plan.price}
                  {plan.note}
                </a>
                <p className="mt-1.5 text-[11px] text-gray-400">{t.stripeNote}</p>
                <button
                  onClick={() => setPaywall(null)}
                  className="mt-3 text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  {t.later}
                </button>
              </div>
            </div>
          );
        })()}

      {/* ごほうびシール・コレクション */}
      {reward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setReward(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-[#1B2A5C]">{t.rewardTitle}</h3>
            <p className="mt-1 text-xs text-gray-500">{t.rewardLead}</p>
            <p className="mt-1 text-sm font-black text-[#C9A050]">
              {stickers} / {STICKERS.length}
            </p>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {STICKERS.map((s, i) => (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-xl text-xl ${
                    i < stickers ? 'bg-[#FFF3D6]' : 'bg-gray-100 opacity-40 grayscale'
                  }`}
                >
                  {i < stickers ? s : '❔'}
                </div>
              ))}
            </div>
            <button
              onClick={() => setReward(false)}
              className="mt-5 rounded-full bg-[#FF6B9D] px-8 py-2.5 text-sm font-black text-white shadow"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const BG_DOTS = [
  { left: 12, top: 20, size: 26, color: '#FF6B9D55', delay: 0 },
  { left: 78, top: 15, size: 34, color: '#FFD23F55', delay: 0.4 },
  { left: 30, top: 70, size: 22, color: '#4ECDC455', delay: 0.8 },
  { left: 65, top: 62, size: 30, color: '#5B8DEF55', delay: 1.2 },
  { left: 48, top: 33, size: 20, color: '#9B6BFF55', delay: 0.2 },
  { left: 88, top: 78, size: 24, color: '#FF8A4755', delay: 1.0 },
  { left: 8, top: 55, size: 28, color: '#5FD35F55', delay: 0.6 },
  { left: 55, top: 88, size: 18, color: '#FF4D6D55', delay: 1.4 },
];

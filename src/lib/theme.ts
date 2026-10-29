import { Platform, useColorScheme } from 'react-native';

const light = {
  bg: '#F2F4F7',
  surface: '#FFFFFF',
  surface2: '#E8ECF1',
  ink: '#0F1B2D',
  muted: '#5D6A7E',
  line: '#DCE2EA',
  accent: '#2346D9',
  onAccent: '#FFFFFF',
  ok: '#1B8A57',
  warn: '#B86E00',
  alert: '#CF3328',
  frost: '#1E87B5',
  okBg: '#E2F3EA',
  warnBg: '#FBEFD9',
  alertBg: '#FBE4E2',
  frostBg: '#DDF0F8',
  accentBg: '#E3E8FC',
  metal: '#3B4657',
  metalHi: '#A3AEBE',
};

const dark: typeof light = {
  bg: '#0B1017',
  surface: '#141B25',
  surface2: '#1C2532',
  ink: '#E8EDF3',
  muted: '#93A0B2',
  line: '#253041',
  accent: '#7690FF',
  onAccent: '#0B1017',
  ok: '#48C68B',
  warn: '#F0A43A',
  alert: '#FF6B5E',
  frost: '#7CCBEB',
  okBg: '#11291C',
  warnBg: '#2F220D',
  alertBg: '#351614',
  frostBg: '#0E2733',
  accentBg: '#1A2347',
  metal: '#C4CDD9',
  metalHi: '#F2F5F9',
};

export type Palette = typeof light;
export const palettes = { light, dark };

/** Alarm screens (countdown, locked) always use the dark palette. */
export const alarm = dark;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const type = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.2 },
  title: { fontSize: 24, fontWeight: '700' as const },
  title2: { fontSize: 20, fontWeight: '700' as const },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 17, fontWeight: '400' as const },
  callout: { fontSize: 15, fontWeight: '400' as const },
  footnote: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
};

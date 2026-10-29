import { fmtM, inSafeZone, isPaused } from './engine';
import type { State } from './store';
import type { Palette } from './theme';

export type StatusView = {
  title: string;
  subtitle: string;
  tone: 'ok' | 'warn' | 'alert' | 'frost' | 'muted';
  led: string;
  pulse: boolean;
  blink: boolean;
};

const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** One place that turns app state into what the status card says. */
export function statusFor(s: State, c: Palette): StatusView {
  const w = s.wearable === 'ring' ? 'Ring' : 'Watch';
  const r = s.reading;
  if (s.phase === 'locked') return { title: 'Phone locked down', subtitle: 'Unlock to continue', tone: 'alert', led: c.alert, pulse: false, blink: true };
  if (s.phase === 'countdown') return { title: `${w} out of range`, subtitle: 'Locking soon', tone: 'warn', led: c.warn, pulse: false, blink: true };
  if (isPaused(s)) return { title: 'Protection paused', subtitle: `Back on at ${clock(s.pausedUntil)}`, tone: 'warn', led: c.warn, pulse: false, blink: false };
  if (inSafeZone(s)) {
    const zone = s.safeZones.find(z => z.id === s.currentPlace)?.name ?? 'Safe zone';
    return {
      title: `Safe zone: ${zone}`,
      subtitle: s.zone === 'away' ? `${w} is elsewhere, and that's fine here` : `${w} ${fmtM(r.distance)} away`,
      tone: 'frost',
      led: c.frost,
      pulse: false,
      blink: false,
    };
  }
  if (s.zone === 'weak') return { title: `${w} signal weak`, subtitle: `Keep your phone close · ${fmtM(r.distance)}`, tone: 'warn', led: c.warn, pulse: false, blink: false };
  return { title: "You're protected", subtitle: `${w} ${fmtM(r.distance)} away`, tone: 'ok', led: c.accent, pulse: true, blink: false };
}

export function toneColors(tone: StatusView['tone'], c: Palette) {
  switch (tone) {
    case 'ok':
      return { bg: c.surface, fg: c.ok };
    case 'warn':
      return { bg: c.warnBg, fg: c.warn };
    case 'alert':
      return { bg: c.alertBg, fg: c.alert };
    case 'frost':
      return { bg: c.frostBg, fg: c.frost };
    default:
      return { bg: c.surface, fg: c.muted };
  }
}

export function relTime(ts: number) {
  const d = Math.round((Date.now() - ts) / 1000);
  if (d < 10) return 'Just now';
  if (d < 60) return `${d} s ago`;
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  return clock(ts);
}

export const timeOf = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function batteryDays(level: number) {
  const days = Math.max(0, Math.round(level * 5));
  if (level < 0.15) return 'Charge today';
  return `About ${days} day${days === 1 ? '' : 's'} left`;
}

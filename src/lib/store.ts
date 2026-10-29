import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { FREEZABLE_ACCOUNTS, LOCKABLE_APPS } from './catalog';
import type { Reading } from './ring/types';

export type Zone = 'near' | 'weak' | 'away';
export type Phase = 'armed' | 'countdown' | 'locked';
export type EventKind = 'ok' | 'info' | 'warn' | 'alert' | 'frost';
export type AppEvent = { id: string; ts: number; kind: EventKind; text: string };
export type WearableType = 'ring' | 'watch';
export type SafeZone = { id: string; name: string; detail: string; enabled: boolean };
/** 0 none · 1 bring ring · 2 Face ID · 3 unfreeze accounts · 4 all clear */
export type RecoveryStep = 0 | 1 | 2 | 3 | 4;

export type State = {
  hydrated: boolean;

  // Saved on the phone
  onboarded: boolean;
  wearable: WearableType;
  ringPaired: boolean;
  ringId: string | null;
  ringName: string;
  protectedApps: string[];
  freezeAccounts: string[];
  addedAccounts: string[];
  graceSeconds: number;
  lockDistance: number;
  safeZones: SafeZone[];
  notifications: boolean;
  faceIdForChanges: boolean;
  trustedContact: { name: string; phone: string } | null;
  events: AppEvent[];
  demoHintDismissed: boolean;
  phase: Phase;
  lockedApps: string[];
  frozenAccounts: string[];
  pausedUntil: number;

  // Live only
  reading: Reading;
  zone: Zone;
  countdownEnd: number;
  /** Which safe zone the phone is in right now (simulated location). */
  currentPlace: string | null;
  batteryLow: boolean;
  recovery: RecoveryStep;
  recoveryNote: string;
  busy: boolean;
  demoOpen: boolean;
};

const PERSISTED: (keyof State)[] = [
  'onboarded', 'wearable', 'ringPaired', 'ringId', 'ringName', 'protectedApps', 'freezeAccounts',
  'addedAccounts', 'graceSeconds', 'lockDistance', 'safeZones', 'notifications', 'faceIdForChanges',
  'trustedContact', 'events', 'demoHintDismissed', 'phase', 'lockedApps', 'frozenAccounts', 'pausedUntil',
];

const STORAGE_KEY = 'ringfence:v1';

export function defaults(): State {
  return {
    hydrated: false,
    onboarded: false,
    wearable: 'ring',
    ringPaired: false,
    ringId: null,
    ringName: 'Ringfence Ring',
    protectedApps: LOCKABLE_APPS.filter(a => a.defaultOn).map(a => a.id),
    freezeAccounts: FREEZABLE_ACCOUNTS.filter(a => a.defaultOn).map(a => a.id),
    addedAccounts: [],
    graceSeconds: 5,
    lockDistance: 10,
    safeZones: [
      { id: 'home', name: 'Home', detail: 'Your home address', enabled: true },
      { id: 'office', name: 'Office', detail: 'Your workplace', enabled: false },
    ],
    notifications: false,
    faceIdForChanges: true,
    trustedContact: null,
    events: [],
    demoHintDismissed: false,
    phase: 'armed',
    lockedApps: [],
    frozenAccounts: [],
    pausedUntil: 0,

    reading: { distance: 0.4, rssi: -48, battery: 0.82, connected: false },
    zone: 'near',
    countdownEnd: 0,
    currentPlace: null,
    batteryLow: false,
    recovery: 0,
    recoveryNote: '',
    busy: false,
    demoOpen: false,
  };
}

type Listener = () => void;
let state: State = defaults();
const listeners = new Set<Listener>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const store = {
  get: () => state,
  set(patch: Partial<State> | ((s: State) => Partial<State>)) {
    const p = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...p };
    listeners.forEach(l => l());
    if (PERSISTED.some(k => k in p)) scheduleSave();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const out: Record<string, unknown> = {};
    PERSISTED.forEach(k => (out[k] = state[k]));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(out)).catch(() => {});
  }, 300);
}

export async function hydrate() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<State>;
      if (saved.phase === 'countdown') saved.phase = 'armed';
      state = { ...state, ...saved };
    }
  } catch {
    // Start fresh if storage is unreadable.
  }
  store.set({ hydrated: true });
}

export async function clearSaved() {
  await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}

/** Subscribe a component to the whole app state. */
export function useApp(): State {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

let counter = 0;
export function log(text: string, kind: EventKind = 'info') {
  const ev: AppEvent = { id: `${Date.now()}-${counter++}`, ts: Date.now(), kind, text };
  store.set(s => ({ events: [ev, ...s.events].slice(0, 150) }));
}

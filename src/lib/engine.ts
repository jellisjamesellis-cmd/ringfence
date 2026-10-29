/**
 * The protection engine: watches ring readings and decides when to warn, lock and recover.
 * All app and bank actions are simulated in this prototype.
 */
import { accountById, appById } from './catalog';
import { confirmIdentity, haptic, notify } from './device';
import { demo, ring } from './ring';
import type { Reading } from './ring/types';
import { clearSaved, defaults, log, store, type State, type Zone } from './store';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const UNLOCK_RANGE_M = 1.5;

export const wearableWord = (s: State) => (s.wearable === 'ring' ? 'ring' : 'watch');
export const fmtM = (d: number) => `${d.toFixed(1)} m`;

export function zoneFor(r: Reading, lockDistance: number): Zone {
  if (!r.connected || r.distance > lockDistance) return 'away';
  if (r.distance > lockDistance * 0.5) return 'weak';
  return 'near';
}

export function inSafeZone(s: State) {
  return !!s.currentPlace && s.safeZones.some(z => z.enabled && z.id === s.currentPlace);
}

export function isPaused(s: State) {
  return s.pausedUntil > Date.now();
}

function protectionActive(s: State) {
  return s.onboarded && s.ringPaired && !isPaused(s) && !inSafeZone(s);
}

let started = false;

export function startEngine() {
  if (started) return;
  started = true;
  const s = store.get();
  if (s.ringPaired && s.ringId) ring.restore(s.ringId);
  ring.subscribe(onReading);
  setInterval(tick, 250);
}

function onReading(r: Reading) {
  const s = store.get();
  if (!s.ringPaired) {
    store.set({ reading: r });
    return;
  }
  const zone = zoneFor(r, s.lockDistance);
  const prev = s.zone;
  store.set({ reading: r, zone });
  if (zone !== prev && s.onboarded) logZoneChange(prev, zone, r);
  evaluate();
}

function logZoneChange(prev: Zone, next: Zone, r: Reading) {
  const s = store.get();
  const w = wearableWord(s);
  if (next === 'weak' && prev === 'near') log(`${cap(w)} signal weak (${fmtM(r.distance)})`, 'warn');
  if (next === 'away') {
    log(`${cap(w)} out of range (${r.connected ? fmtM(r.distance) : 'connection lost'})`, 'alert');
    if (inSafeZone(s)) log(`You're in a safe zone, so nothing locked`, 'info');
    else if (isPaused(s)) log('Protection is paused, so nothing locked', 'warn');
  }
  if (next === 'near' && prev !== 'near') log(`${cap(w)} back in range (${fmtM(r.distance)})`, 'ok');
}

export function evaluate() {
  const s = store.get();
  if (s.phase === 'armed' && s.zone === 'away' && protectionActive(s)) {
    if (s.graceSeconds === 0) {
      lockDown();
    } else {
      store.set({ phase: 'countdown', countdownEnd: Date.now() + s.graceSeconds * 1000 });
      log(`Grace period started: locking in ${s.graceSeconds} s`, 'warn');
      haptic.warning();
      if (s.notifications) notify(`${cap(wearableWord(s))} out of range`, `Protected apps lock in ${s.graceSeconds} seconds.`);
    }
  } else if (s.phase === 'countdown' && (s.zone !== 'away' || !protectionActive(s))) {
    store.set({ phase: 'armed' });
    log(s.zone !== 'away' ? `${cap(wearableWord(s))} came back in time. Lock cancelled.` : 'Lock cancelled', 'ok');
    haptic.success();
  }

  const now = store.get();
  if (now.phase === 'locked' && now.recovery === 1 && now.reading.connected && now.reading.distance <= UNLOCK_RANGE_M) {
    store.set({ recovery: 2, recoveryNote: '' });
    log(`${cap(wearableWord(now))} detected next to the phone`, 'ok');
    haptic.success();
  }
}

function tick() {
  const s = store.get();
  if (s.phase === 'countdown' && Date.now() >= s.countdownEnd) lockDown();
  if (s.pausedUntil && Date.now() >= s.pausedUntil) {
    store.set({ pausedUntil: 0 });
    log('Pause ended. Protection is back on.', 'info');
    evaluate();
  }
}

export function lockDown() {
  const s = store.get();
  if (s.phase === 'locked') return;
  const apps = s.protectedApps;
  const accts = s.freezeAccounts;
  store.set({ phase: 'locked', lockedApps: apps, frozenAccounts: accts, recovery: 0, recoveryNote: '', busy: false });
  log(`Protection triggered: phone separated from your ${wearableWord(s)}`, 'alert');
  apps.forEach(id => log(`${appById(id)?.name ?? id} locked on this phone`, 'alert'));
  accts.forEach(id => {
    const a = accountById(id);
    if (a) log(`${a.name}: freeze sent to ${a.provider}`, 'frost');
  });
  if (s.trustedContact) log(`Alert sent to ${s.trustedContact.name}`, 'info');
  haptic.buzz(3);
  if (s.notifications) {
    notify('Phone separated from your ring', `${apps.length} apps locked · ${accts.length} accounts frozen`);
  }
}

// ----- Countdown -----

export async function cancelCountdownWithFaceId() {
  const res = await confirmIdentity('Cancel the lock');
  if (!res.ok) return;
  if (store.get().phase !== 'countdown') return;
  store.set({ phase: 'armed', pausedUntil: Date.now() + 60 * 60 * 1000 });
  log('Lock cancelled with Face ID. Protection paused for 1 hour.', 'warn');
  haptic.success();
}

// ----- Recovery -----

export function startRecovery() {
  const s = store.get();
  const near = s.reading.connected && s.reading.distance <= UNLOCK_RANGE_M;
  store.set({ recovery: near ? 2 : 1, recoveryNote: '' });
  log('Unlock started on the phone', 'info');
  if (near) log(`${cap(wearableWord(s))} detected next to the phone`, 'ok');
}

export function cancelRecovery() {
  store.set({ recovery: 0, recoveryNote: '' });
}

export function tryWithoutRing() {
  const s = store.get();
  store.set({ recoveryNote: `No ${wearableWord(s)} found. Nothing unlocks without it.` });
  log(`Unlock attempted without the ${wearableWord(s)}. Refused.`, 'alert');
  haptic.error();
}

export async function unlockWithFace(asSomeoneElse = false) {
  const s = store.get();
  if (!(s.reading.connected && s.reading.distance <= UNLOCK_RANGE_M)) {
    store.set({ recovery: 1, recoveryNote: `Your ${wearableWord(s)} moved away. Bring it back first.` });
    return;
  }
  store.set({ busy: true, recoveryNote: '' });
  if (asSomeoneElse) {
    await wait(1300);
    store.set({ busy: false, recoveryNote: 'Face not recognised. Apps stay locked.' });
    log('Face ID failed. Apps stay locked.', 'alert');
    haptic.error();
    return;
  }
  const res = await confirmIdentity('Unlock your protected apps');
  if (!res.ok) {
    store.set({ busy: false, recoveryNote: 'Face ID was cancelled. Apps stay locked.' });
    return;
  }
  const n = store.get().lockedApps.length;
  store.set({ lockedApps: [], busy: false });
  log(`Face ID confirmed. ${n} app${n === 1 ? '' : 's'} unlocked.`, 'ok');
  haptic.success();
  const frozen = store.get().frozenAccounts.length;
  if (frozen) {
    log(`${frozen} account${frozen === 1 ? '' : 's'} stay frozen until each provider confirms`, 'frost');
    store.set({ recovery: 3 });
  } else {
    store.set({ recovery: 4 });
  }
}

export type UnfreezeMethod = 'app' | 'call' | 'branch';
const METHOD_LABEL: Record<UnfreezeMethod, string> = {
  app: 'in-app ID check',
  call: 'phone call',
  branch: 'branch visit',
};

export async function requestUnfreeze(method: UnfreezeMethod) {
  store.set({ busy: true });
  log(`Unfreeze requested by ${METHOD_LABEL[method]}`, 'info');
  await wait(1800);
  for (const id of [...store.get().frozenAccounts]) {
    store.set(s => ({ frozenAccounts: s.frozenAccounts.filter(x => x !== id) }));
    log(`${accountById(id)?.name ?? id}: unfrozen`, 'ok');
    haptic.tap();
    await wait(350);
  }
  store.set({ busy: false, recovery: 4 });
  haptic.success();
}

export function finishRecovery() {
  store.set({ phase: 'armed', recovery: 0, recoveryNote: '', lockedApps: [], frozenAccounts: [] });
  log('Protection re-armed', 'ok');
  evaluate();
}

// ----- Pause -----

export async function pauseProtection(minutes: number) {
  const res = await confirmIdentity('Pause protection');
  if (!res.ok) return false;
  store.set({ pausedUntil: Date.now() + minutes * 60 * 1000 });
  log(`Protection paused for ${minutes >= 60 ? `${minutes / 60} hour` : `${minutes} minutes`}`, 'warn');
  haptic.success();
  return true;
}

export function resumeProtection() {
  store.set({ pausedUntil: 0 });
  log('Protection resumed', 'ok');
  evaluate();
}

// ----- Settings guarded by Face ID -----

/** Ask for Face ID before a change that weakens protection, if the user has that setting on. */
export async function guard(reason: string) {
  if (!store.get().faceIdForChanges) return true;
  const res = await confirmIdentity(reason);
  return res.ok;
}

// ----- Pairing -----

export async function pairRing(id: string, name: string) {
  await ring.pair(id);
  store.set({ ringPaired: true, ringId: id, ringName: name });
  log(`${name} paired with this phone`, 'ok');
}

export function unpairRing() {
  ring.unpair();
  store.set({ ringPaired: false, ringId: null, onboarded: false, phase: 'armed' });
  log('Ring unpaired', 'warn');
}

// ----- Demo -----

export function demoSnatch() {
  log('Phone snatched from your hand (demo)', 'alert');
  demo.moveTo(26, 1500);
}

export function demoBringBack() {
  demo.moveTo(0.3, 1100);
}

export function demoSetPlace(place: string | null) {
  store.set({ currentPlace: place });
  log(place ? `Arrived at ${place === 'home' ? 'Home' : 'Office'} (demo)` : 'Left the safe zone (demo)', 'info');
  evaluate();
}

export function demoSetBatteryLow(low: boolean) {
  demo.setBatteryLow(low);
  store.set({ batteryLow: low });
  if (low) log('Ring battery low (8%)', 'warn');
}

export async function resetApp() {
  await clearSaved();
  ring.unpair();
  demo.setDistance(0.4);
  demo.setBatteryLow(false);
  store.set({ ...defaults(), hydrated: true });
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

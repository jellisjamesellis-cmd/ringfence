import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { accountById, appById } from '@/lib/catalog';
import {
  cancelCountdownWithFaceId,
  cancelRecovery,
  finishRecovery,
  fmtM,
  requestUnfreeze,
  startRecovery,
  tryWithoutRing,
  unlockWithFace,
  type UnfreezeMethod,
} from '@/lib/engine';
import { store, useApp, type State } from '@/lib/store';
import { alarm as c, mono } from '@/lib/theme';

import { Icon } from './Icon';
import { AppIcon, Button } from './ui';
import { WearableVisual } from './WearableVisual';

/** Full-screen countdown, lock screen and recovery flow. Sits above the whole app. */
export function ProtectionOverlay() {
  const s = useApp();
  const visible = s.hydrated && (s.phase === 'countdown' || s.phase === 'locked');
  const fade = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(fade, { toValue: visible ? 1 : 0, duration: visible ? 220 : 260, useNativeDriver: true }).start(() => {
      if (!visible) setMounted(false);
    });
  }, [visible, fade]);

  if (!mounted) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade, backgroundColor: c.bg, zIndex: 50 }]}>
      {s.phase === 'countdown' ? <Countdown s={s} /> : <Locked s={s} />}
    </Animated.View>
  );
}

function DemoPill() {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={() => store.set({ demoOpen: true })}
      hitSlop={8}
      style={{
        position: 'absolute',
        top: insets.top + 8,
        right: 16,
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: c.surface2,
      }}>
      <Icon name="sliders" size={14} color={c.muted} />
      <Text style={{ color: c.muted, fontSize: 13, fontWeight: '600' }}>Demo</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------

function Countdown({ s }: { s: State }) {
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);
  const total = s.graceSeconds * 1000;
  const left = Math.max(0, s.countdownEnd - now);
  const secs = Math.ceil(left / 1000);
  const R = 92;
  const C = 2 * Math.PI * R;
  const frac = total ? left / total : 0;
  const w = s.wearable === 'ring' ? 'ring' : 'watch';

  return (
    <View style={{ flex: 1, backgroundColor: c.warnBg, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}>
      <DemoPill />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={220} height={220} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={110} cy={110} r={R} stroke={c.surface2} strokeWidth={10} fill="none" />
            <Circle
              cx={110}
              cy={110}
              r={R}
              stroke={c.warn}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={C * (1 - frac)}
            />
          </Svg>
          <Text style={{ color: c.ink, fontSize: 84, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{secs}</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Text style={{ color: c.warn, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
            {w === 'ring' ? 'Ring' : 'Watch'} out of range
          </Text>
          <Text style={{ color: c.ink, fontSize: 28, fontWeight: '700', textAlign: 'center' }}>Locking your phone</Text>
          <Text style={{ color: c.muted, fontSize: 16, lineHeight: 23, textAlign: 'center', maxWidth: 320 }}>
            {s.protectedApps.length} apps will lock and {s.freezeAccounts.length} accounts will freeze unless your {w} comes back.
          </Text>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Button title="It's me: cancel with Face ID" icon="face" variant="light" onPress={cancelCountdownWithFaceId} palette={c} />
        <Text style={{ color: c.muted, fontSize: 13, textAlign: 'center' }}>Cancelling pauses protection for 1 hour.</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

function Locked({ s }: { s: State }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <DemoPill />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 22, flexGrow: 1 }}>
        {s.recovery === 0 ? <LockScreen s={s} /> : <Recovery s={s} />}
      </ScrollView>
    </View>
  );
}

function LockScreen({ s }: { s: State }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const apps = s.lockedApps.map(appById).filter(Boolean);
  const accts = s.frozenAccounts.map(accountById).filter(Boolean);

  return (
    <View style={{ flex: 1, gap: 24 }}>
      <View style={{ alignItems: 'center', gap: 18 }}>
        <Animated.View
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            backgroundColor: c.alertBg,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
          }}>
          <Icon name="lock" size={50} color={c.alert} strokeWidth={1.8} />
        </Animated.View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ color: c.ink, fontSize: 28, fontWeight: '700', textAlign: 'center' }}>This phone is locked down</Text>
          <Text style={{ color: c.muted, fontSize: 16, lineHeight: 23, textAlign: 'center', maxWidth: 330 }}>
            It was separated from its owner's {s.wearable}. Personal apps are locked and bank accounts are frozen.
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: c.surface, borderRadius: 18, padding: 16, gap: 14 }}>
        {apps.length ? (
          <View style={{ gap: 10 }}>
            <Text style={{ color: c.alert, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Locked · {apps.length}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {apps.map(a => (
                <View key={a!.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surface2, borderRadius: 999, paddingRight: 10, padding: 3 }}>
                  <AppIcon icon={a!.icon} color={a!.color} size={22} />
                  <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600' }}>{a!.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {accts.length ? (
          <View style={{ gap: 10 }}>
            <Text style={{ color: c.frost, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Frozen · {accts.length}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {accts.map(a => (
                <View key={a!.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.frostBg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
                  <Icon name="frost" size={14} color={c.frost} strokeWidth={2.2} />
                  <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600' }}>{a!.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {s.trustedContact ? (
        <View style={{ backgroundColor: c.surface, borderRadius: 18, padding: 16, gap: 4 }}>
          <Text style={{ color: c.muted, fontSize: 13 }}>Found this phone? Contact the owner's friend</Text>
          <Text style={{ color: c.ink, fontSize: 17, fontWeight: '600' }}>
            {s.trustedContact.name} · <Text style={{ fontFamily: mono }}>{s.trustedContact.phone}</Text>
          </Text>
        </View>
      ) : null}

      <View style={{ flex: 1 }} />
      <Button title="Unlock" icon="lock" variant="light" onPress={startRecovery} palette={c} />
    </View>
  );
}

// ---------------------------------------------------------------------------

function Steps({ n }: { n: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3].map(i => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= n ? c.accent : c.surface2 }} />
      ))}
    </View>
  );
}

function StepHead({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <View style={{ gap: 14 }}>
      <Steps n={n} />
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Step {n} of 3</Text>
      <Text style={{ color: c.ink, fontSize: 28, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: c.muted, fontSize: 16, lineHeight: 23 }}>{body}</Text>
    </View>
  );
}

function Note({ text, tone = 'alert' }: { text: string; tone?: 'alert' | 'ok' }) {
  if (!text) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 10, backgroundColor: tone === 'alert' ? c.alertBg : c.okBg, borderRadius: 14, padding: 14 }}>
      <Icon name={tone === 'alert' ? 'warning' : 'check'} size={20} color={tone === 'alert' ? c.alert : c.ok} />
      <Text style={{ color: c.ink, fontSize: 15, lineHeight: 21, flex: 1 }}>{text}</Text>
    </View>
  );
}

function Recovery({ s }: { s: State }) {
  const [method, setMethod] = useState<UnfreezeMethod>('app');
  const w = s.wearable === 'ring' ? 'ring' : 'watch';
  const r = s.reading;

  if (s.recovery === 1) {
    return (
      <View style={{ flex: 1, gap: 22 }}>
        <StepHead n={1} title={`Bring your ${w} to the phone`} body={`Hold the phone in the hand wearing your ${w}. It needs to be within 1.5 m.`} />
        <View style={{ alignItems: 'center' }}>
          <WearableVisual type={s.wearable} size={130} led={c.accent} pulse blink metal={c.metal} metalHi={c.metalHi} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.surface, borderRadius: 16, padding: 16 }}>
          <Text style={{ color: c.muted, fontSize: 15 }}>{w === 'ring' ? 'Ring' : 'Watch'} distance</Text>
          <Text style={{ color: c.ink, fontSize: 22, fontFamily: mono, fontVariant: ['tabular-nums'] }}>{r.connected ? fmtM(r.distance) : 'Not found'}</Text>
        </View>
        <Note text={s.recoveryNote} />
        <Text style={{ color: c.muted, fontSize: 14, textAlign: 'center' }}>Demo: open demo controls and tap "Bring the ring back".</Text>
        <View style={{ flex: 1 }} />
        <Button title={`Try without the ${w}`} variant="secondary" onPress={tryWithoutRing} palette={c} />
        <Button title="Back" variant="ghost" onPress={cancelRecovery} palette={c} />
      </View>
    );
  }

  if (s.recovery === 2) {
    return (
      <View style={{ flex: 1, gap: 22 }}>
        <StepHead n={2} title="Confirm it's you" body={`Your ${w} is here. Face ID unlocks your apps.`} />
        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
          <View style={{ width: 120, height: 120, borderRadius: 30, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="face" size={64} color={s.recoveryNote ? c.alert : c.accent} strokeWidth={1.5} />
          </View>
        </View>
        <Note text={s.recoveryNote} />
        <View style={{ flex: 1 }} />
        <Button title="Use Face ID" icon="face" variant="light" onPress={() => unlockWithFace(false)} loading={s.busy} palette={c} />
        <Button title="Try with someone else's face" variant="ghost" onPress={() => unlockWithFace(true)} disabled={s.busy} palette={c} />
      </View>
    );
  }

  if (s.recovery === 3) {
    const all = s.freezeAccounts.map(accountById).filter(Boolean);
    const options: { id: UnfreezeMethod; title: string; body: string }[] = [
      { id: 'app', title: 'ID check in your bank app', body: 'Photo ID and a selfie, from a laptop or another device' },
      { id: 'call', title: 'Call your bank', body: 'Use the number on the back of your card' },
      { id: 'branch', title: 'Visit a branch', body: 'Take photo ID with you' },
    ];
    return (
      <View style={{ flex: 1, gap: 20 }}>
        <StepHead n={3} title="Unfreeze your accounts" body="Apps are unlocked. Money needs one more check: each provider confirms it's you before your accounts open again." />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {all.map(a => {
            const frozen = s.frozenAccounts.includes(a!.id);
            return (
              <View key={a!.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: frozen ? c.frostBg : c.okBg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
                <Icon name={frozen ? 'frost' : 'check'} size={14} color={frozen ? c.frost : c.ok} strokeWidth={2.2} />
                <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600' }}>{a!.name}</Text>
              </View>
            );
          })}
        </View>
        {s.busy ? (
          <Note text="Waiting for your providers to confirm…" tone="ok" />
        ) : (
          <View style={{ gap: 8 }}>
            {options.map(o => {
              const on = o.id === method;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => setMethod(o.id)}
                  style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: c.surface, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: on ? c.accent : 'transparent' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? c.accent : c.muted, alignItems: 'center', justifyContent: 'center' }}>
                    {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.accent }} /> : null}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: c.ink, fontSize: 16, fontWeight: '600' }}>{o.title}</Text>
                    <Text style={{ color: c.muted, fontSize: 13 }}>{o.body}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        <View style={{ flex: 1 }} />
        <Button title={s.busy ? 'Checking…' : 'Request unfreeze'} variant="light" onPress={() => requestUnfreeze(method)} loading={s.busy} palette={c} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, gap: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 104, height: 104, borderRadius: 30, backgroundColor: c.okBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="shieldCheck" size={56} color={c.ok} strokeWidth={1.7} />
      </View>
      <Text style={{ color: c.ink, fontSize: 30, fontWeight: '700' }}>All clear</Text>
      <Text style={{ color: c.muted, fontSize: 16, lineHeight: 23, textAlign: 'center', maxWidth: 320 }}>
        Apps unlocked and accounts unfrozen. Protection is back on.
      </Text>
      <View style={{ alignSelf: 'stretch', marginTop: 20 }}>
        <Button title="Done" variant="light" onPress={finishRecovery} palette={c} />
      </View>
    </View>
  );
}

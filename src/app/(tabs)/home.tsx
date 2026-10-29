import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EventRow } from '@/components/EventRow';
import { Icon } from '@/components/Icon';
import { Battery, Button, Card, Group, Screen, signalLabel, SignalBars } from '@/components/ui';
import { WearableVisual } from '@/components/WearableVisual';
import { haptic } from '@/lib/device';
import { fmtM, isPaused, pauseProtection, resumeProtection } from '@/lib/engine';
import { ring } from '@/lib/ring';
import { statusFor, toneColors, relTime } from '@/lib/status';
import { store, useApp } from '@/lib/store';
import { mono, type as T, useTheme } from '@/lib/theme';

export default function Home() {
  const c = useTheme();
  const s = useApp();
  const st = statusFor(s, c);
  const tone = toneColors(st.tone, c);
  const r = s.reading;
  const [finding, setFinding] = useState(false);
  const paused = isPaused(s);
  const w = s.wearable === 'ring' ? 'ring' : 'watch';

  const openDemo = () => {
    haptic.impact();
    store.set({ demoOpen: true });
  };

  const find = async () => {
    setFinding(true);
    haptic.buzz(4);
    await ring.find();
    setFinding(false);
  };

  return (
    <Screen
      left={
        <Pressable onLongPress={openDemo} delayLongPress={500} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 5, borderColor: c.ink, alignItems: 'center' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.accent, marginTop: -6 }} />
          </View>
          <Text style={{ color: c.ink, fontSize: 24, fontWeight: '700' }}>Ringfence</Text>
        </Pressable>
      }
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
          <Icon name={s.wearable === 'ring' ? 'ring' : 'watch'} size={16} color={c.muted} />
          <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{Math.round(r.battery * 100)}%</Text>
          <Battery level={r.battery} color={r.battery < 0.15 ? c.alert : c.ok} dim={c.muted} />
        </View>
      }>
      {/* Status */}
      <Card tone={tone.bg} style={{ alignItems: 'center', paddingVertical: 8, gap: 0 }}>
        <WearableVisual type={s.wearable} size={128} led={st.led} pulse={st.pulse} blink={st.blink} />
        <View style={{ alignItems: 'center', gap: 4, marginTop: -6 }}>
          <Text style={[T.title, { color: st.tone === 'ok' ? c.ink : tone.fg }]}>{st.title}</Text>
          <Text style={[T.callout, { color: c.muted }]}>{st.subtitle}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: 18, marginBottom: 10, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 14 }}>
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text style={[T.caption, { color: c.muted }]}>Distance</Text>
            <Text style={{ color: c.ink, fontSize: 20, fontFamily: mono, fontVariant: ['tabular-nums'] }}>{r.connected ? fmtM(r.distance) : '—'}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text style={[T.caption, { color: c.muted }]}>Signal</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 26 }}>
              <SignalBars rssi={r.connected ? r.rssi : -120} color={c.ok} dim={c.line} />
              <Text style={{ color: c.ink, fontSize: 15, fontWeight: '600' }}>{signalLabel(r.rssi, r.connected)}</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text style={[T.caption, { color: c.muted }]}>Lock at</Text>
            <Text style={{ color: c.ink, fontSize: 20, fontFamily: mono }}>{s.lockDistance} m</Text>
          </View>
        </View>
      </Card>

      {s.batteryLow || r.battery < 0.15 ? (
        <Card tone={c.warnBg} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="warning" size={22} color={c.warn} />
          <Text style={[T.callout, { color: c.ink, flex: 1, lineHeight: 20 }]}>
            Ring battery is at {Math.round(r.battery * 100)}%. Charge it tonight so protection stays on tomorrow.
          </Text>
        </Card>
      ) : null}

      {/* What's protected */}
      <Pressable onPress={() => router.push('/protection')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: c.ink, fontSize: 30, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{s.protectedApps.length}</Text>
            <Text style={[T.footnote, { color: c.muted }]}>apps lock</Text>
          </View>
          <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: c.line, marginHorizontal: 16 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: c.ink, fontSize: 30, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{s.freezeAccounts.length}</Text>
            <Text style={[T.footnote, { color: c.muted }]}>accounts freeze</Text>
          </View>
          <Icon name="chevron" size={20} color={c.muted} />
        </Card>
      </Pressable>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          {paused ? (
            <Button title="Resume" icon="play" variant="secondary" onPress={resumeProtection} />
          ) : (
            <Button title="Pause 1 hour" icon="pause" variant="secondary" onPress={() => pauseProtection(60)} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Button title={finding ? 'Buzzing…' : `Find ${w}`} icon="vibrate" variant="secondary" onPress={find} disabled={finding || !r.connected} />
        </View>
      </View>

      {/* Demo hint */}
      {!s.demoHintDismissed ? (
        <Card tone={c.accentBg} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="sliders" size={20} color={c.accent} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[T.headline, { color: c.ink }]}>Try a simulated theft</Text>
              <Text style={[T.footnote, { color: c.muted, lineHeight: 18 }]}>
                Demo controls let you move the ring away, snatch the phone and walk through getting back in. You can also open them any time by holding the Ringfence logo.
              </Text>
            </View>
            <Pressable hitSlop={10} onPress={() => store.set({ demoHintDismissed: true })}>
              <Icon name="close" size={18} color={c.muted} />
            </Pressable>
          </View>
          <Button title="Open demo controls" onPress={openDemo} />
        </Card>
      ) : null}

      {/* Recent activity */}
      <Group title="Recent activity">
        {s.events.slice(0, 4).map((ev, i, arr) => (
          <EventRow key={ev.id} ev={ev} time={relTime(ev.ts)} last={i === arr.length - 1} />
        ))}
        <Pressable onPress={() => router.push('/activity')} style={{ padding: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: c.line }}>
          <Text style={{ color: c.accent, fontWeight: '600', fontSize: 15 }}>See all activity</Text>
        </Pressable>
      </Group>
    </Screen>
  );
}

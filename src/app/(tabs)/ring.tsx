import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Battery, Card, Group, Row, Screen, Segmented, signalLabel, SignalBars } from '@/components/ui';
import { WearableVisual } from '@/components/WearableVisual';
import { haptic } from '@/lib/device';
import { fmtM, guard, unpairRing } from '@/lib/engine';
import { ring, watchLinkAvailable } from '@/lib/ring';
import { batteryDays, statusFor } from '@/lib/status';
import { log, store, useApp, type WearableType } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

export default function RingTab() {
  const c = useTheme();
  const s = useApp();
  const r = s.reading;
  const st = statusFor(s, c);
  const [finding, setFinding] = useState(false);
  const isRing = s.wearable === 'ring';

  const find = async () => {
    setFinding(true);
    log(`Find my ${isRing ? 'ring' : 'watch'}: vibrating`, 'info');
    haptic.buzz(4);
    await ring.find();
    setFinding(false);
  };

  const unpair = () => {
    Alert.alert(`Unpair ${s.ringName}?`, 'Protection turns off until you pair again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unpair',
        style: 'destructive',
        onPress: async () => {
          if (!(await guard('Unpair your ring'))) return;
          unpairRing();
          router.replace('/onboarding/pair');
        },
      },
    ]);
  };

  return (
    <Screen title={isRing ? 'Your ring' : 'Your watch'}>
      <Card style={{ alignItems: 'center', gap: 4, paddingBottom: 22 }}>
        <WearableVisual type={s.wearable} size={140} led={st.led} pulse={st.pulse} blink={st.blink} watchText={r.connected ? fmtM(r.distance) : 'No link'} />
        <Text style={[T.title2, { color: c.ink }]}>{s.ringName}</Text>
        <Text style={[T.callout, { color: r.connected ? c.ok : c.alert }]}>
          {r.connected ? `Connected · ${fmtM(r.distance)} away` : 'Not connected'}
        </Text>
      </Card>

      <Group title="Status">
        <Row
          title="Battery"
          subtitle={batteryDays(r.battery)}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: c.ink, fontSize: 15, fontVariant: ['tabular-nums'] }}>{Math.round(r.battery * 100)}%</Text>
              <Battery level={r.battery} color={r.battery < 0.15 ? c.alert : c.ok} dim={c.muted} />
            </View>
          }
        />
        <Row
          title="Signal"
          subtitle={r.connected ? `${r.rssi} dBm over Bluetooth LE` : 'Out of range'}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: c.ink, fontSize: 15 }}>{signalLabel(r.rssi, r.connected)}</Text>
              <SignalBars rssi={r.connected ? r.rssi : -120} color={c.ok} dim={c.line} />
            </View>
          }
        />
        <Row title="Model" right={<Text style={{ color: c.muted, fontSize: 15 }}>{isRing ? 'R1 · Size 9' : 'Smartwatch'}</Text>} />
        <Row title="Software" subtitle="Up to date" right={<Text style={{ color: c.muted, fontSize: 15 }}>1.2.0</Text>} />
        <Row title="Device ID" last right={<Text style={{ color: c.muted, fontSize: 15 }}>{(s.ringId ?? '—').slice(-4)}</Text>} />
      </Group>

      <Group>
        <Row glyph="vibrate" title={finding ? `Your ${isRing ? 'ring' : 'watch'} is vibrating…` : `Find my ${isRing ? 'ring' : 'watch'}`} onPress={finding || !r.connected ? undefined : find} disabled={!r.connected} />
        <Row glyph="trash" title={`Unpair ${isRing ? 'ring' : 'watch'}`} destructive onPress={unpair} last />
      </Group>

      <Group title="Real watch" footer="Use a watch you already wear, such as a Polar Vantage, instead of the simulated ring.">
        <Row
          glyph="watch"
          title={s.ringSource === 'watch' ? s.watchName ?? 'Your watch' : 'Connect your Polar watch'}
          subtitle={
            s.ringSource === 'watch'
              ? r.connected
                ? 'In use · connected'
                : 'In use · not connected'
              : watchLinkAvailable
                ? 'Uses Bluetooth'
                : 'Needs the installed Ringfence app'
          }
          onPress={() => router.push('/watch-link')}
          chevron
          last
        />
      </Group>

      <Group title="Wearable type" footer="A Ringfence Ring is harder to snatch than a watch, and lasts about 5 days per charge.">
        <View style={{ padding: 12 }}>
          <Segmented<WearableType>
            options={[
              { label: 'Ringfence Ring', value: 'ring' },
              { label: 'Smartwatch', value: 'watch' },
            ]}
            value={s.wearable}
            onChange={v => {
              store.set({ wearable: v, ringName: v === 'ring' ? 'Ringfence Ring' : 'Your smartwatch' });
              log(`Wearable switched to ${v === 'ring' ? 'ring' : 'smartwatch'}`, 'info');
            }}
          />
        </View>
      </Group>
    </Screen>
  );
}

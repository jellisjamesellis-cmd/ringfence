import { useEffect, useReducer, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { WatchDevice } from '../../modules/watch-link/src';
import { Icon } from '@/components/Icon';
import { Battery, Button, Card, Group, Row, signalLabel, SignalBars } from '@/components/ui';
import { haptic } from '@/lib/device';
import { fmtM, selectRealWatch, selectSimulatedRing } from '@/lib/engine';
import { watchLinkAvailable, watchRing } from '@/lib/ring';
import { timeOf } from '@/lib/status';
import { useApp } from '@/lib/store';
import { mono, type as T, useTheme } from '@/lib/theme';

export default function WatchLinkScreen() {
  const c = useTheme();
  const s = useApp();
  const [, refresh] = useReducer((x: number) => x + 1, 0);
  const [searching, setSearching] = useState(false);
  const [devices, setDevices] = useState<WatchDevice[] | null>(null);

  useEffect(() => (watchRing ? watchRing.onInfo(refresh) : undefined), []);

  if (!watchLinkAvailable || !watchRing) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card style={{ gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.warnBg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="watch" size={26} color={c.warn} />
          </View>
          <Text style={[T.title2, { color: c.ink }]}>Needs the Ringfence app</Text>
          <Text style={[T.callout, { color: c.muted, lineHeight: 22 }]}>
            Connecting a real watch uses Bluetooth, which Expo Go doesn't allow. It works in the installed Ringfence app. Until then, the simulated ring runs everything.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  const wr = watchRing;
  const r = wr.current();
  const active = s.ringSource === 'watch';

  const search = async () => {
    setSearching(true);
    setDevices(null);
    const list = await wr.findDevices();
    setDevices(list);
    setSearching(false);
    haptic.tap();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
      {active ? (
        <Card style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: r.connected ? c.ok : c.alert }} />
            <View style={{ flex: 1 }}>
              <Text style={[T.headline, { color: c.ink }]}>{s.watchName ?? 'Your watch'}</Text>
              <Text style={[T.footnote, { color: c.muted }]}>
                {r.connected ? 'Connected · protecting this phone' : 'Not connected · reconnects when back in range'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[T.caption, { color: c.muted }]}>Signal</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SignalBars rssi={r.connected ? r.rssi : -120} color={c.ok} dim={c.line} />
                <Text style={{ color: c.ink, fontFamily: mono, fontSize: 15 }}>{r.connected ? `${r.rssi}` : '—'}</Text>
              </View>
              <Text style={[T.footnote, { color: c.muted }]}>{signalLabel(r.rssi, r.connected)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[T.caption, { color: c.muted }]}>Distance</Text>
              <Text style={{ color: c.ink, fontFamily: mono, fontSize: 20 }}>{r.connected ? `~${fmtM(r.distance)}` : '—'}</Text>
              <Text style={[T.footnote, { color: c.muted }]}>Estimate</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[T.caption, { color: c.muted }]}>Drops</Text>
              <Text style={{ color: c.ink, fontFamily: mono, fontSize: 20 }}>{wr.disconnects}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Battery level={r.battery} color={c.ok} dim={c.muted} />
                <Text style={[T.footnote, { color: c.muted }]}>{Math.round(r.battery * 100)}%</Text>
              </View>
            </View>
          </View>
          <Button
            title="Calibrate: phone next to watch"
            variant="secondary"
            icon="sliders"
            disabled={!r.connected}
            onPress={() => {
              if (wr.calibrate()) haptic.success();
            }}
          />
          <Text style={[T.footnote, { color: c.muted, lineHeight: 18 }]}>
            Protection triggers when the connection drops. To test, leave the phone on a table and walk away with the watch. iPhone usually notices within a few seconds once you're out of range.
          </Text>
        </Card>
      ) : (
        <Card style={{ gap: 10 }}>
          <Text style={[T.title2, { color: c.ink }]}>Use your Polar as the ring</Text>
          <Text style={[T.callout, { color: c.muted, lineHeight: 22 }]}>
            Open Polar Flow first so your watch is connected to this iPhone. Ringfence then joins that connection and reacts the moment it drops.
          </Text>
        </Card>
      )}

      <Button title={searching ? 'Searching…' : active ? 'Find a different watch' : 'Find my watch'} icon="search" onPress={search} loading={searching} variant={active ? 'secondary' : 'primary'} />

      {devices ? (
        devices.length ? (
          <Group title="Found" footer="Connected means the watch is already linked to this iPhone, usually through Polar Flow. That's the one to pick.">
            {devices.map((d, i) => (
              <Row
                key={d.id}
                glyph={/polar/i.test(d.name) ? 'watch' : 'signal'}
                title={d.name}
                subtitle={d.connected ? 'Connected to this iPhone' : `Nearby · ${d.rssi ?? '?'} dBm`}
                last={i === devices.length - 1}
                onPress={() => {
                  selectRealWatch(d.id, d.name);
                  haptic.success();
                }}
                right={s.watchId === d.id && active ? <Icon name="check" size={20} color={c.ok} strokeWidth={2.4} /> : undefined}
              />
            ))}
          </Group>
        ) : (
          <Card tone={c.warnBg} style={{ gap: 6 }}>
            <Text style={[T.headline, { color: c.ink }]}>No watch found</Text>
            <Text style={[T.footnote, { color: c.ink, lineHeight: 18 }]}>
              Check Bluetooth is on and that you allowed Ringfence to use it. Open Polar Flow, let the watch sync, then try again.
            </Text>
          </Card>
        )
      ) : null}

      {active ? <Button title="Go back to the simulated ring" variant="ghost" onPress={selectSimulatedRing} /> : null}

      {wr.history.length ? (
        <Group title="Connection log">
          {wr.history.slice(0, 20).map((e, i, arr) => (
            <Row
              key={`${e.ts}-${i}`}
              title={e.text}
              subtitle={timeOf(e.ts)}
              last={i === arr.length - 1}
              right={<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: e.kind === 'ok' ? c.ok : e.kind === 'alert' ? c.alert : c.accent }} />}
            />
          ))}
        </Group>
      ) : null}

      <Text style={[T.footnote, { color: c.muted, textAlign: 'center' }]}>Bluetooth: {wr.bluetooth}</Text>
    </ScrollView>
  );
}

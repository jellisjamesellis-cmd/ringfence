import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { Group, Row, Screen, Segmented, Toggle } from '@/components/ui';
import { requestNotifications } from '@/lib/device';
import { guard, resetApp } from '@/lib/engine';
import { log, store, useApp } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function Settings() {
  const c = useTheme();
  const s = useApp();

  const setGrace = async (v: number) => {
    if (v > s.graceSeconds && !(await guard('Make protection slower'))) return;
    store.set({ graceSeconds: v });
    log(`Grace period set to ${v ? `${v} s` : 'instant'}`, 'info');
  };

  const setDistance = async (v: number) => {
    if (v > s.lockDistance && !(await guard('Increase lock distance'))) return;
    store.set({ lockDistance: v });
    log(`Lock distance set to ${v} m`, 'info');
  };

  const setZone = async (id: string, enabled: boolean) => {
    if (enabled && !(await guard('Add a safe zone'))) return;
    store.set(st => ({ safeZones: st.safeZones.map(z => (z.id === id ? { ...z, enabled } : z)) }));
    log(`Safe zone ${s.safeZones.find(z => z.id === id)?.name}: ${enabled ? 'on' : 'off'}`, 'info');
  };

  const reset = () =>
    Alert.alert('Reset Ringfence?', 'This clears your pairing, settings and activity, and starts setup again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await resetApp();
          router.replace('/onboarding');
        },
      },
    ]);

  return (
    <Screen title="Settings">
      <Group title="Grace period" footer="How long the phone waits after losing your ring before it locks.">
        <View style={{ padding: 12 }}>
          <Segmented
            options={[
              { label: 'Instant', value: 0 },
              { label: '5 s', value: 5 },
              { label: '15 s', value: 15 },
              { label: '30 s', value: 30 },
            ]}
            value={s.graceSeconds}
            onChange={setGrace}
          />
        </View>
      </Group>

      <Group title="Lock distance" footer="How far the phone can get from your ring before protection kicks in.">
        <View style={{ padding: 12 }}>
          <Segmented
            options={[
              { label: '5 m', value: 5 },
              { label: '10 m', value: 10 },
              { label: '15 m', value: 15 },
            ]}
            value={s.lockDistance}
            onChange={setDistance}
          />
        </View>
      </Group>

      <Group title="Safe zones" footer="Being apart from your ring doesn't lock anything while you're in a safe zone.">
        {s.safeZones.map((z, i) => (
          <Row
            key={z.id}
            glyph={z.id === 'home' ? 'home' : 'location'}
            title={z.name}
            subtitle={s.currentPlace === z.id ? "You're here now" : z.detail}
            last={i === s.safeZones.length - 1}
            right={<Toggle value={z.enabled} onChange={v => setZone(z.id, v)} />}
          />
        ))}
      </Group>

      <Group title="Alerts">
        <Row
          glyph="bell"
          title="Notifications"
          subtitle="When your phone and ring separate"
          right={
            <Toggle
              value={s.notifications}
              onChange={async v => {
                if (v) store.set({ notifications: await requestNotifications() });
                else store.set({ notifications: false });
              }}
            />
          }
        />
        <Row
          glyph="user"
          title="Trusted contact"
          subtitle={s.trustedContact ? `${s.trustedContact.name} · told if your phone is taken` : 'Someone to alert if your phone is taken'}
          onPress={() => router.push('/trusted-contact')}
          chevron
          last
        />
      </Group>

      <Group title="Security" footer="Stops anyone who has your unlocked phone from weakening protection.">
        <Row
          glyph="face"
          title="Face ID for changes"
          subtitle="Turning things off or slowing them down"
          last
          right={
            <Toggle
              value={s.faceIdForChanges}
              onChange={async v => {
                if (!v && !(await guard('Turn off Face ID for changes'))) return;
                store.set({ faceIdForChanges: v });
              }}
            />
          }
        />
      </Group>

      <Group title="Demo">
        <Row glyph="sliders" title="Open demo controls" onPress={() => store.set({ demoOpen: true })} chevron />
        <Row glyph="trash" title="Reset app" destructive onPress={reset} last />
      </Group>

      <Text style={{ color: c.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
        Ringfence 0.1 prototype{'\n'}The ring, bank and app connections in this version are simulated.
      </Text>
    </Screen>
  );
}

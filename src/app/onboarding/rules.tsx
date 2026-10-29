import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { OnboardingStep } from '@/components/OnboardingStep';
import { Button, Card, Group, Row, Segmented, Toggle } from '@/components/ui';
import { store, useApp } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

export default function Rules() {
  const c = useTheme();
  const s = useApp();
  const home = s.safeZones.find(z => z.id === 'home');

  return (
    <OnboardingStep
      step={4}
      title="Set your rules"
      subtitle="Balance speed against false alarms. You can change these any time."
      footer={<Button title="Continue" onPress={() => router.push('/onboarding/permissions')} />}>
      <Card style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Text style={[T.headline, { color: c.ink }]}>Grace period</Text>
          <Text style={[T.footnote, { color: c.muted, lineHeight: 18 }]}>
            How long the phone waits after losing the ring before it locks. A snatch-and-run covers 30 metres in about 5 seconds.
          </Text>
        </View>
        <Segmented
          options={[
            { label: 'Instant', value: 0 },
            { label: '5 s', value: 5 },
            { label: '15 s', value: 15 },
            { label: '30 s', value: 30 },
          ]}
          value={s.graceSeconds}
          onChange={v => store.set({ graceSeconds: v })}
        />
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Text style={[T.headline, { color: c.ink }]}>Lock distance</Text>
          <Text style={[T.footnote, { color: c.muted, lineHeight: 18 }]}>
            How far apart the phone and ring can be before protection kicks in.
          </Text>
        </View>
        <Segmented
          options={[
            { label: '5 m', value: 5 },
            { label: '10 m', value: 10 },
            { label: '15 m', value: 15 },
          ]}
          value={s.lockDistance}
          onChange={v => store.set({ lockDistance: v })}
        />
      </Card>

      <Group
        title="Safe zones"
        footer="Inside a safe zone, leaving your phone in another room won't lock anything. Ringfence uses your phone's location to know when you're there.">
        <Row
          glyph="home"
          title="Home"
          subtitle={home?.enabled ? 'Safe zone on' : 'Off'}
          last
          right={
            <Toggle
              value={!!home?.enabled}
              onChange={v => store.set(st => ({ safeZones: st.safeZones.map(z => (z.id === 'home' ? { ...z, enabled: v } : z)) }))}
            />
          }
        />
      </Group>
    </OnboardingStep>
  );
}

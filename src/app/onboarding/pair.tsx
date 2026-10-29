import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OnboardingStep } from '@/components/OnboardingStep';
import { Button, Card, Segmented, SignalBars } from '@/components/ui';
import { WearableVisual } from '@/components/WearableVisual';
import { haptic } from '@/lib/device';
import { pairRing } from '@/lib/engine';
import { ring, type FoundDevice } from '@/lib/ring';
import { store, useApp, type WearableType } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

type Stage = 'idle' | 'scanning' | 'found' | 'pairing' | 'paired';

export default function Pair() {
  const c = useTheme();
  const s = useApp();
  const [stage, setStage] = useState<Stage>(s.ringPaired ? 'paired' : 'idle');
  const [device, setDevice] = useState<FoundDevice | null>(null);
  const word = s.wearable === 'ring' ? 'ring' : 'watch';

  const scan = async () => {
    setStage('scanning');
    const found = await ring.scan();
    setDevice(
      s.wearable === 'watch'
        ? { ...found[0], id: 'WATCH-4F12', name: 'Your smartwatch', model: 'Paired over Bluetooth' }
        : found[0],
    );
    haptic.success();
    setStage('found');
  };

  const pair = async () => {
    if (!device) return;
    setStage('pairing');
    await pairRing(device.id, device.name);
    haptic.success();
    setStage('paired');
  };

  const led = stage === 'paired' ? c.ok : c.accent;
  const titles: Record<Stage, string> = {
    idle: `Pair your ${word}`,
    scanning: `Looking for your ${word}…`,
    found: `${word === 'ring' ? 'Ring' : 'Watch'} found`,
    pairing: 'Pairing…',
    paired: `${word === 'ring' ? 'Ring' : 'Watch'} paired`,
  };

  return (
    <OnboardingStep
      step={1}
      title={titles[stage]}
      subtitle={
        stage === 'paired'
          ? `Your phone and ${word} now keep track of each other.`
          : word === 'ring'
            ? 'Hold the button on the inside of your ring for 3 seconds until the light flashes blue.'
            : 'Open the Ringfence app on your watch and keep it near your phone.'
      }
      footer={
        stage === 'paired' ? (
          <Button title="Continue" onPress={() => router.push('/onboarding/apps')} />
        ) : stage === 'found' ? (
          <Button title={`Pair ${device?.name ?? ''}`} onPress={pair} />
        ) : (
          <Button
            title={stage === 'idle' ? `Find my ${word}` : stage === 'pairing' ? 'Pairing…' : 'Searching…'}
            onPress={scan}
            loading={stage === 'scanning' || stage === 'pairing'}
          />
        )
      }>
      {stage === 'idle' ? (
        <Segmented<WearableType>
          options={[
            { label: 'Ringfence Ring', value: 'ring' },
            { label: 'Smartwatch', value: 'watch' },
          ]}
          value={s.wearable}
          onChange={v => store.set({ wearable: v })}
        />
      ) : null}

      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <WearableVisual
          type={s.wearable}
          size={150}
          led={led}
          pulse={stage === 'scanning' || stage === 'pairing' || stage === 'idle'}
          blink={stage === 'scanning'}
        />
      </View>

      {(stage === 'found' || stage === 'pairing' || stage === 'paired') && device ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: stage === 'paired' ? c.okBg : c.accentBg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={stage === 'paired' ? 'check' : word === 'ring' ? 'ring' : 'watch'} size={22} color={stage === 'paired' ? c.ok : c.accent} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[T.headline, { color: c.ink }]}>{device.name}</Text>
            <Text style={[T.footnote, { color: c.muted }]}>
              {device.model} · {device.id.slice(-4)}
            </Text>
          </View>
          <SignalBars rssi={device.rssi} color={c.ok} dim={c.surface2} />
        </Card>
      ) : null}

      {stage === 'idle' ? (
        <Pressable onPress={() => store.set({ wearable: s.wearable === 'ring' ? 'watch' : 'ring' })}>
          <Text style={[T.footnote, { color: c.muted, textAlign: 'center' }]}>
            {word === 'ring' ? "Don't have a ring yet? Use a smartwatch instead." : 'Using a Ringfence Ring? Switch back above.'}
          </Text>
        </Pressable>
      ) : null}
    </OnboardingStep>
  );
}

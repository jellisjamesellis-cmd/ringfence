import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Button, Card } from '@/components/ui';
import { log, store, useApp } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

export default function Done() {
  const c = useTheme();
  const s = useApp();
  const insets = useSafeAreaInsets();
  const home = s.safeZones.find(z => z.id === 'home')?.enabled;

  const lines = [
    `${s.wearable === 'ring' ? 'Ring' : 'Watch'} paired: ${s.ringName}`,
    `${s.protectedApps.length} apps lock on this phone`,
    `${s.freezeAccounts.length} accounts freeze with your provider`,
    `Locks after ${s.graceSeconds ? `${s.graceSeconds} seconds` : 'no delay'}, beyond ${s.lockDistance} m`,
    home ? 'Home is a safe zone' : 'No safe zones yet',
  ];

  const finish = () => {
    store.set({ onboarded: true, phase: 'armed' });
    log(`Protection on: ${s.protectedApps.length} apps lock, ${s.freezeAccounts.length} accounts freeze`, 'ok');
    router.replace('/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 12, paddingHorizontal: 16 }}>
      <View style={{ flex: 1, gap: 24 }}>
        <View style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: c.okBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="shieldCheck" size={46} color={c.ok} strokeWidth={1.8} />
        </View>
        <View style={{ gap: 8 }}>
          <Text style={[T.title, { color: c.ink, fontSize: 32 }]}>You're protected</Text>
          <Text style={[T.callout, { color: c.muted, lineHeight: 22 }]}>
            Keep your {s.wearable} on and carry on as normal. Ringfence works in the background.
          </Text>
        </View>
        <Card style={{ gap: 12 }}>
          {lines.map(l => (
            <View key={l} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon name="check" size={18} color={c.ok} strokeWidth={2.4} />
              <Text style={[T.callout, { color: c.ink, flex: 1 }]}>{l}</Text>
            </View>
          ))}
        </Card>
        <Card tone={c.accentBg} style={{ flexDirection: 'row', gap: 12 }}>
          <Icon name="info" size={20} color={c.accent} />
          <Text style={[T.footnote, { color: c.ink, flex: 1, lineHeight: 18 }]}>
            Want to see it in action? On the home screen, press and hold the Ringfence logo to open demo controls and simulate a snatch.
          </Text>
        </Card>
      </View>
      <Button title="Go to Ringfence" onPress={finish} />
    </View>
  );
}

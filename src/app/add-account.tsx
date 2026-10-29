import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Button, Group, Row } from '@/components/ui';
import { ADDABLE_ACCOUNTS } from '@/lib/catalog';
import { haptic } from '@/lib/device';
import { log, store, useApp } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

export default function AddAccount() {
  const c = useTheme();
  const s = useApp();
  const available = ADDABLE_ACCOUNTS.filter(a => !s.addedAccounts.includes(a.id));

  const add = (id: string, name: string) => {
    store.set(st => ({ addedAccounts: [...st.addedAccounts, id], freezeAccounts: [...st.freezeAccounts, id] }));
    log(`${name} added: will freeze if your phone is taken`, 'ok');
    haptic.success();
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 20 }}>
      <Text style={[T.callout, { color: c.muted, lineHeight: 22 }]}>
        Connect another account so it freezes with the rest. In the real app you'd sign in to your provider here.
      </Text>
      {available.length ? (
        <Group>
          {available.map((a, i) => (
            <Row
              key={a.id}
              icon={a.icon}
              iconColor={a.color}
              title={a.name}
              subtitle={`${a.provider} · ${a.detail}`}
              last={i === available.length - 1}
              right={
                <View style={{ width: 76 }}>
                  <Button title="Add" variant="secondary" onPress={() => add(a.id, a.name)} />
                </View>
              }
            />
          ))}
        </Group>
      ) : (
        <Text style={[T.callout, { color: c.ink }]}>You've added every account available in this prototype.</Text>
      )}
    </ScrollView>
  );
}

import { router } from 'expo-router';
import { Text } from 'react-native';

import { Group, Row, Screen, Toggle } from '@/components/ui';
import { accountById, FREEZABLE_ACCOUNTS, LOCKABLE_APPS } from '@/lib/catalog';
import { guard } from '@/lib/engine';
import { log, store, useApp } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

export default function Protection() {
  const c = useTheme();
  const s = useApp();

  const accounts = [...FREEZABLE_ACCOUNTS.map(a => a.id), ...s.addedAccounts]
    .map(id => accountById(id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  const setApp = async (id: string, on: boolean) => {
    if (!on && !(await guard('Turn off protection for this app'))) return;
    store.set(st => ({ protectedApps: on ? [...st.protectedApps, id] : st.protectedApps.filter(x => x !== id) }));
    log(`${LOCKABLE_APPS.find(a => a.id === id)?.name}: protection ${on ? 'on' : 'off'}`, on ? 'ok' : 'warn');
  };

  const setAccount = async (id: string, on: boolean) => {
    if (!on && !(await guard('Stop freezing this account'))) return;
    store.set(st => ({ freezeAccounts: on ? [...st.freezeAccounts, id] : st.freezeAccounts.filter(x => x !== id) }));
    log(`${accountById(id)?.name}: freeze ${on ? 'on' : 'off'}`, on ? 'ok' : 'warn');
  };

  return (
    <Screen title="Protection">
      <Text style={[T.callout, { color: c.muted, lineHeight: 22, marginTop: -8 }]}>
        If your phone leaves your {s.wearable}, these apps lock straight away and these accounts are frozen with your provider.
      </Text>

      <Group title={`Lock on this phone · ${s.protectedApps.length}`} footer={s.faceIdForChanges ? 'Turning protection off needs Face ID.' : undefined}>
        {LOCKABLE_APPS.map((a, i) => (
          <Row
            key={a.id}
            icon={a.icon}
            iconColor={a.color}
            title={a.name}
            subtitle={a.detail}
            last={i === LOCKABLE_APPS.length - 1}
            right={<Toggle value={s.protectedApps.includes(a.id)} onChange={v => setApp(a.id, v)} />}
          />
        ))}
      </Group>

      <Group
        title={`Freeze with your provider · ${s.freezeAccounts.length}`}
        footer="Freezes block card payments, transfers and new credit. Unfreezing needs a check with each provider, so the ring alone can't release your money.">
        {accounts.map(a => (
          <Row
            key={a.id}
            icon={a.icon}
            iconColor={a.color}
            title={a.name}
            subtitle={`${a.provider} · ${a.detail}`}
            right={<Toggle value={s.freezeAccounts.includes(a.id)} onChange={v => setAccount(a.id, v)} />}
          />
        ))}
        <Row glyph="plus" title="Add an account" onPress={() => router.push('/add-account')} chevron last />
      </Group>
    </Screen>
  );
}

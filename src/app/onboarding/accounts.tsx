import { router } from 'expo-router';

import { OnboardingStep } from '@/components/OnboardingStep';
import { Button, Group, Row, Toggle } from '@/components/ui';
import { FREEZABLE_ACCOUNTS } from '@/lib/catalog';
import { store, useApp } from '@/lib/store';

export default function ChooseAccounts() {
  const s = useApp();
  const toggle = (id: string, on: boolean) =>
    store.set(st => ({ freezeAccounts: on ? [...st.freezeAccounts, id] : st.freezeAccounts.filter(x => x !== id) }));

  return (
    <OnboardingStep
      step={3}
      title="Choose accounts to freeze"
      subtitle="Freezes happen with your bank, not just on the phone, so they hold even if the thief takes out the SIM."
      footer={
        <Button
          title={s.freezeAccounts.length ? `Freeze ${s.freezeAccounts.length} account${s.freezeAccounts.length === 1 ? '' : 's'}` : 'Skip for now'}
          onPress={() => router.push('/onboarding/rules')}
        />
      }>
      <Group footer="In this prototype, freezes are simulated. Real freezes need each provider to connect to Ringfence.">
        {FREEZABLE_ACCOUNTS.map((a, i) => (
          <Row
            key={a.id}
            icon={a.icon}
            iconColor={a.color}
            title={a.name}
            subtitle={`${a.provider} · ${a.detail}`}
            last={i === FREEZABLE_ACCOUNTS.length - 1}
            right={<Toggle value={s.freezeAccounts.includes(a.id)} onChange={v => toggle(a.id, v)} />}
          />
        ))}
      </Group>
    </OnboardingStep>
  );
}

import { router } from 'expo-router';

import { OnboardingStep } from '@/components/OnboardingStep';
import { Button, Group, Row, Toggle } from '@/components/ui';
import { LOCKABLE_APPS } from '@/lib/catalog';
import { store, useApp } from '@/lib/store';

export default function ChooseApps() {
  const s = useApp();
  const toggle = (id: string, on: boolean) =>
    store.set(st => ({ protectedApps: on ? [...st.protectedApps, id] : st.protectedApps.filter(x => x !== id) }));

  return (
    <OnboardingStep
      step={2}
      title="Choose apps to lock"
      subtitle="These lock on this phone the moment it's separated from your ring. We've picked the ones thieves go for first."
      footer={
        <Button
          title={`Lock ${s.protectedApps.length} app${s.protectedApps.length === 1 ? '' : 's'}`}
          onPress={() => router.push('/onboarding/accounts')}
          disabled={s.protectedApps.length === 0}
        />
      }>
      <Group footer="Mail and Messages matter most: they hold the reset codes for everything else.">
        {LOCKABLE_APPS.map((a, i) => (
          <Row
            key={a.id}
            icon={a.icon}
            iconColor={a.color}
            title={a.name}
            subtitle={a.detail}
            last={i === LOCKABLE_APPS.length - 1}
            right={<Toggle value={s.protectedApps.includes(a.id)} onChange={v => toggle(a.id, v)} />}
          />
        ))}
      </Group>
    </OnboardingStep>
  );
}

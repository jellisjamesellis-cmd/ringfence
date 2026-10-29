import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OnboardingStep } from '@/components/OnboardingStep';
import { Button, Card } from '@/components/ui';
import { confirmIdentity, haptic, requestNotifications } from '@/lib/device';
import { store, useApp } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

function PermissionCard({
  icon,
  title,
  body,
  done,
  doneText,
  action,
  onPress,
}: {
  icon: IconName;
  title: string;
  body: string;
  done: boolean;
  doneText: string;
  action: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: done ? c.okBg : c.accentBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={done ? 'check' : icon} size={22} color={done ? c.ok : c.accent} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[T.headline, { color: c.ink }]}>{title}</Text>
          <Text style={[T.footnote, { color: c.muted, lineHeight: 18 }]}>{done ? doneText : body}</Text>
        </View>
      </View>
      {!done ? <Button title={action} variant="secondary" onPress={onPress} /> : null}
    </Card>
  );
}

export default function Permissions() {
  const s = useApp();
  const [faceDone, setFaceDone] = useState(false);
  const [faceNote, setFaceNote] = useState('Face ID is working.');

  return (
    <OnboardingStep
      step={5}
      title="Two quick permissions"
      subtitle="So Ringfence can warn you straight away and make sure only you can unlock."
      footer={<Button title="Finish setup" onPress={() => router.push('/onboarding/done')} />}>
      <PermissionCard
        icon="bell"
        title="Alerts"
        body="Get a notification the moment your phone and ring separate."
        done={s.notifications}
        doneText="Alerts are on."
        action="Allow alerts"
        onPress={async () => {
          const ok = await requestNotifications();
          store.set({ notifications: ok });
          if (ok) haptic.success();
        }}
      />
      <PermissionCard
        icon="face"
        title="Face ID"
        body="Needed to unlock your apps after the ring is back, and to change protection settings."
        done={faceDone}
        doneText={faceNote}
        action="Test Face ID"
        onPress={async () => {
          const res = await confirmIdentity('Set up Ringfence');
          if (res.ok) {
            setFaceNote(res.simulated ? 'Face ID isn’t set up on this device, so the demo will simulate it.' : 'Face ID is working.');
            setFaceDone(true);
            haptic.success();
          }
        }}
      />
    </OnboardingStep>
  );
}

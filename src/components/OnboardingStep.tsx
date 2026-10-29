import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type as T, useTheme } from '@/lib/theme';

import { BackButton } from './ui';

const TOTAL = 5;

/** Shared frame for onboarding steps: back button, progress, title, content, pinned footer. */
export function OnboardingStep({
  step,
  title,
  subtitle,
  children,
  footer,
  hideBack,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
  hideBack?: boolean;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {hideBack ? <View style={{ width: 40, height: 40 }} /> : <BackButton />}
        <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? c.accent : c.surface2 }} />
          ))}
        </View>
        <Text style={{ color: c.muted, fontSize: 13, fontVariant: ['tabular-nums'], width: 40, textAlign: 'right' }}>
          {step}/{TOTAL}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 24, gap: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          <Text style={[T.title, { color: c.ink, fontSize: 30, lineHeight: 36 }]}>{title}</Text>
          {subtitle ? <Text style={[T.callout, { color: c.muted, lineHeight: 22 }]}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 12, gap: 8 }}>{footer}</View>
    </View>
  );
}

import { StyleSheet, Text, View } from 'react-native';

import type { AppEvent } from '@/lib/store';
import { mono, useTheme } from '@/lib/theme';

import { Icon, type IconName } from './Icon';

const ICON: Record<AppEvent['kind'], IconName> = {
  ok: 'check',
  info: 'info',
  warn: 'warning',
  alert: 'lock',
  frost: 'frost',
};

export function EventRow({ ev, time, last }: { ev: AppEvent; time: string; last?: boolean }) {
  const c = useTheme();
  const color = { ok: c.ok, info: c.accent, warn: c.warn, alert: c.alert, frost: c.frost }[ev.kind];
  const bg = { ok: c.okBg, info: c.accentBg, warn: c.warnBg, alert: c.alertBg, frost: c.frostBg }[ev.kind];
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingLeft: 16 }}>
      <View style={{ paddingTop: 12 }}>
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={ICON[ev.kind]} size={15} color={color} strokeWidth={2.2} />
        </View>
      </View>
      <View
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingRight: 16,
          gap: 2,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: c.line,
        }}>
        <Text style={{ color: c.ink, fontSize: 15, lineHeight: 20 }}>{ev.text}</Text>
        <Text style={{ color: c.muted, fontSize: 12, fontFamily: mono }}>{time}</Text>
      </View>
    </View>
  );
}

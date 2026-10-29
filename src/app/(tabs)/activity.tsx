import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EventRow } from '@/components/EventRow';
import { Icon } from '@/components/Icon';
import { Card, Group, Screen, Segmented } from '@/components/ui';
import { timeOf } from '@/lib/status';
import { store, useApp, type AppEvent } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

function dayLabel(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Activity() {
  const c = useTheme();
  const s = useApp();
  const [filter, setFilter] = useState<'all' | 'alerts'>('all');

  const groups = useMemo(() => {
    const list = filter === 'all' ? s.events : s.events.filter(e => e.kind === 'alert' || e.kind === 'warn' || e.kind === 'frost');
    const out: { label: string; items: AppEvent[] }[] = [];
    list.forEach(e => {
      const label = dayLabel(e.ts);
      const g = out.find(x => x.label === label);
      if (g) g.items.push(e);
      else out.push({ label, items: [e] });
    });
    return out;
  }, [s.events, filter]);

  return (
    <Screen
      title="Activity"
      right={
        s.events.length ? (
          <Pressable hitSlop={10} onPress={() => store.set({ events: [] })}>
            <Text style={{ color: c.accent, fontSize: 16, fontWeight: '600' }}>Clear</Text>
          </Pressable>
        ) : null
      }>
      <Segmented
        options={[
          { label: 'Everything', value: 'all' },
          { label: 'Alerts only', value: 'alerts' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {groups.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }}>
          <Icon name="activity" size={28} color={c.muted} />
          <Text style={[T.headline, { color: c.ink }]}>Nothing yet</Text>
          <Text style={[T.footnote, { color: c.muted, textAlign: 'center' }]}>
            Separations, locks and unlocks will appear here.
          </Text>
        </Card>
      ) : (
        groups.map(g => (
          <View key={g.label}>
            <Group title={g.label}>
              {g.items.map((ev, i) => (
                <EventRow key={ev.id} ev={ev} time={timeOf(ev.ts)} last={i === g.items.length - 1} />
              ))}
            </Group>
          </View>
        ))
      )}
    </Screen>
  );
}

import { Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components/Icon';
import { useTheme } from '@/lib/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'home', title: 'Home', icon: 'shield' },
  { name: 'protection', title: 'Protection', icon: 'lock' },
  { name: 'ring', title: 'Ring', icon: 'ring' },
  { name: 'activity', title: 'Activity', icon: 'activity' },
  { name: 'settings', title: 'Settings', icon: 'settings' },
];

export default function TabsLayout() {
  const c = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      {TABS.map(t => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) => <Icon name={t.icon} size={24} color={color as string} strokeWidth={1.9} />,
          }}
        />
      ))}
    </Tabs>
  );
}

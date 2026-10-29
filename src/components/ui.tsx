import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '@/lib/device';
import { type as T, useTheme } from '@/lib/theme';

import { Icon, type IconName } from './Icon';

/** A scrolling screen with an iOS-style large title. */
export function Screen({
  title,
  right,
  left,
  children,
  bottomPad = 32,
}: {
  title?: string;
  right?: ReactNode;
  left?: ReactNode;
  children: ReactNode;
  bottomPad?: number;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: bottomPad, paddingHorizontal: 16, gap: 20 }}
      showsVerticalScrollIndicator={false}>
      {(title || right || left) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
          {left ?? <Text style={[T.largeTitle, { color: c.ink }]}>{title}</Text>}
          {right}
        </View>
      )}
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, tone }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: string }) {
  const c = useTheme();
  return (
    <View style={[{ backgroundColor: tone ?? c.surface, borderRadius: 20, padding: 18 }, style]}>{children}</View>
  );
}

/** An inset grouped list section, like iOS Settings. */
export function Group({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const c = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {title ? <Text style={[T.caption, { color: c.muted, paddingHorizontal: 16 }]}>{title}</Text> : null}
      <View style={{ backgroundColor: c.surface, borderRadius: 16, overflow: 'hidden' }}>{children}</View>
      {footer ? <Text style={[T.footnote, { color: c.muted, paddingHorizontal: 16, lineHeight: 18 }]}>{footer}</Text> : null}
    </View>
  );
}

export function AppIcon({ icon, color, size = 32 }: { icon: IconName; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={icon} size={size * 0.58} color="#FFFFFF" strokeWidth={2} />
    </View>
  );
}

export function Row({
  title,
  subtitle,
  icon,
  iconColor,
  glyph,
  right,
  onPress,
  chevron,
  destructive,
  last,
  disabled,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  glyph?: IconName;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  last?: boolean;
  disabled?: boolean;
}) {
  const c = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16 }}>
      {icon && iconColor ? <AppIcon icon={icon} color={iconColor} /> : null}
      {glyph ? <Icon name={glyph} size={22} color={destructive ? c.alert : c.accent} /> : null}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 12,
          paddingRight: 16,
          minHeight: 52,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: c.line,
        }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[T.body, { color: destructive ? c.alert : c.ink }]}>{title}</Text>
          {subtitle ? <Text style={[T.footnote, { color: c.muted }]}>{subtitle}</Text> : null}
        </View>
        {right}
        {chevron ? <Icon name="chevron" size={18} color={c.muted} /> : null}
      </View>
    </View>
  );
  if (!onPress) return <View style={{ opacity: disabled ? 0.5 : 1 }}>{content}</View>;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ backgroundColor: pressed ? c.surface2 : 'transparent', opacity: disabled ? 0.5 : 1 })}>
      {content}
    </Pressable>
  );
}

export function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const c = useTheme();
  return (
    <Switch
      value={value}
      disabled={disabled}
      onValueChange={v => {
        haptic.tap();
        onChange(v);
      }}
      trackColor={{ true: c.accent, false: c.surface2 }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={c.surface2}
    />
  );
}

export function Segmented<V extends string | number>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { label: string; value: V }[];
  value: V;
  onChange: (v: V) => void;
  disabled?: boolean;
}) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: 11, padding: 3, gap: 2, opacity: disabled ? 0.5 : 1 }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            disabled={disabled}
            onPress={() => {
              if (!on) haptic.tap();
              onChange(o.value);
            }}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: on ? c.surface : 'transparent',
              shadowColor: '#000',
              shadowOpacity: on ? 0.08 : 0,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
            }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: on ? c.ink : c.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  palette,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  palette?: ReturnType<typeof useTheme>;
}) {
  const themed = useTheme();
  const c = palette ?? themed;
  const bg = {
    primary: c.accent,
    secondary: c.surface2,
    ghost: 'transparent',
    danger: c.alert,
    light: '#FFFFFF',
  }[variant];
  const fg = {
    primary: c.onAccent,
    secondary: c.ink,
    ghost: c.accent,
    danger: '#FFFFFF',
    light: '#0F1B2D',
  }[variant];
  return (
    <Pressable
      onPress={() => {
        haptic.impact();
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderRadius: 14,
        minHeight: 52,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      })}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={20} color={fg} strokeWidth={2} /> : null}
          <Text style={{ color: fg, fontSize: 17, fontWeight: '600' }}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress?: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      hitSlop={12}
      onPress={onPress ?? (() => router.back())}
      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="back" size={20} color={c.ink} strokeWidth={2.2} />
    </Pressable>
  );
}

export function SignalBars({ rssi, color, dim }: { rssi: number; color: string; dim: string }) {
  const bars = rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : rssi > -90 ? 1 : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 14 }}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={{ width: 4, height: 5 + i * 3, borderRadius: 1, backgroundColor: i < bars ? color : dim }} />
      ))}
    </View>
  );
}

export function signalLabel(rssi: number, connected: boolean) {
  if (!connected) return 'No signal';
  if (rssi > -60) return 'Strong';
  if (rssi > -72) return 'Good';
  if (rssi > -82) return 'Weak';
  return 'Very weak';
}

export function Battery({ level, color, dim }: { level: number; color: string; dim: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      <View style={{ width: 22, height: 11, borderRadius: 3, borderWidth: 1.2, borderColor: dim, padding: 1 }}>
        <View style={{ width: `${Math.max(6, level * 100)}%` as `${number}%`, height: '100%', borderRadius: 1.5, backgroundColor: color }} />
      </View>
      <View style={{ width: 2, height: 4, borderRadius: 1, backgroundColor: dim }} />
    </View>
  );
}

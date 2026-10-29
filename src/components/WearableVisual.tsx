import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Ellipse, Rect } from 'react-native-svg';

import type { WearableType } from '@/lib/store';
import { useTheme } from '@/lib/theme';

type Props = {
  type: WearableType;
  size?: number;
  led: string;
  /** Blink the LED (warning / alarm). */
  blink?: boolean;
  /** Show expanding signal rings (scanning or protected). */
  pulse?: boolean;
  metal?: string;
  metalHi?: string;
  watchText?: string;
};

export function WearableVisual({ type, size = 120, led, blink, pulse, metal, metalHi, watchText }: Props) {
  const c = useTheme();
  const m = metal ?? c.metal;
  const mh = metalHi ?? c.metalHi;
  const ledOpacity = useRef(new Animated.Value(1)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!blink) {
      ledOpacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ledOpacity, { toValue: 0.25, duration: 420, useNativeDriver: true }),
        Animated.timing(ledOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blink, ledOpacity]);

  useEffect(() => {
    if (!pulse) {
      wave.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(wave, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, wave]);

  const box = size * 1.5;

  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      {pulse ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: led,
            opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
            transform: [{ scale: wave.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.5] }) }],
          }}
        />
      ) : null}

      {type === 'ring' ? (
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} viewBox="0 0 120 120">
            <Ellipse cx={60} cy={64} rx={42} ry={40} fill="none" stroke={m} strokeWidth={15} />
            <Ellipse
              cx={60}
              cy={64}
              rx={42}
              ry={40}
              fill="none"
              stroke={mh}
              strokeWidth={2}
              strokeDasharray="60 400"
              strokeDashoffset={-210}
              opacity={0.7}
            />
            <Rect x={46} y={16} width={28} height={14} rx={7} fill={m} />
          </Svg>
          <Animated.View
            style={{
              position: 'absolute',
              left: size * 0.5 - size * 0.035,
              top: size * 0.1875 - size * 0.035,
              width: size * 0.07,
              height: size * 0.07,
              borderRadius: size,
              backgroundColor: led,
              opacity: ledOpacity,
              shadowColor: led,
              shadowOpacity: 0.9,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        </View>
      ) : (
        <View style={{ width: size * 0.82, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: -size * 0.12, width: size * 0.5, height: size * 0.3, borderRadius: 8, backgroundColor: m, opacity: 0.5 }} />
          <View style={{ position: 'absolute', bottom: -size * 0.12, width: size * 0.5, height: size * 0.3, borderRadius: 8, backgroundColor: m, opacity: 0.5 }} />
          <View
            style={{
              width: '100%',
              height: '100%',
              borderRadius: size * 0.24,
              backgroundColor: '#0A0E14',
              padding: size * 0.06,
            }}>
            <View
              style={{
                flex: 1,
                borderRadius: size * 0.19,
                backgroundColor: '#04070B',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                gap: 4,
              }}>
              <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: led, opacity: ledOpacity }} />
              {watchText ? (
                <Text numberOfLines={3} style={{ color: '#EEF2F8', fontSize: Math.max(9, size * 0.095), textAlign: 'center', fontWeight: '600' }}>
                  {watchText}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

import Slider from '@react-native-community/slider';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { demoBringBack, demoSetBatteryLow, demoSetPlace, demoSnatch, fmtM } from '@/lib/engine';
import { demo } from '@/lib/ring';
import { store, useApp } from '@/lib/store';
import { mono, type as T, useTheme } from '@/lib/theme';

import { Icon } from './Icon';
import { Button, Segmented } from './ui';

/** Hidden controls for running the theft story on the phone itself. */
export function DemoPanel() {
  const c = useTheme();
  const s = useApp();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const slide = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);

  useEffect(() => {
    if (s.demoOpen) setMounted(true);
    Animated.spring(slide, { toValue: s.demoOpen ? 1 : 0, useNativeDriver: true, damping: 22, stiffness: 220 }).start(({ finished }) => {
      if (finished && !s.demoOpen) setMounted(false);
    });
  }, [s.demoOpen, slide]);

  if (!mounted) return null;

  const close = () => store.set({ demoOpen: false });
  const r = s.reading;
  const zoneColor = s.zone === 'near' ? c.ok : s.zone === 'weak' ? c.warn : c.alert;
  const shown = dragging ?? r.distance;
  const notReady = !s.onboarded || !s.ringPaired;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)', opacity: slide }]}>
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: c.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 16,
          gap: 18,
          transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }],
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 20,
        }}>
        <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: c.line }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text style={[T.title2, { color: c.ink }]}>Demo controls</Text>
            <Text style={[T.footnote, { color: c.muted }]}>Simulates the ring, location and battery</Text>
          </View>
          <Pressable onPress={close} hitSlop={10} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={18} color={c.ink} strokeWidth={2.2} />
          </Pressable>
        </View>

        {notReady ? (
          <Text style={[T.callout, { color: c.muted }]}>Finish setup and pair your ring first, then come back here.</Text>
        ) : (
          <>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={[T.headline, { color: c.ink }]}>Distance from {s.wearable === 'ring' ? 'ring' : 'watch'}</Text>
                <Text style={{ color: zoneColor, fontSize: 20, fontFamily: mono, fontVariant: ['tabular-nums'] }}>{fmtM(shown)}</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={30}
                step={0.1}
                value={dragging ?? r.distance}
                minimumTrackTintColor={zoneColor}
                maximumTrackTintColor={c.line}
                onSlidingStart={v => setDragging(v)}
                onValueChange={v => {
                  setDragging(v);
                  demo.setDistance(v);
                }}
                onSlidingComplete={v => {
                  demo.setDistance(v);
                  setDragging(null);
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[T.footnote, { color: c.muted }]}>0 m</Text>
                <Text style={[T.footnote, { color: c.muted }]}>Locks beyond {s.lockDistance} m</Text>
                <Text style={[T.footnote, { color: c.muted }]}>30 m</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Snatch phone"
                  icon="run"
                  variant="danger"
                  onPress={() => {
                    demoSnatch();
                    close();
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Bring ring back" icon="ring" variant="secondary" onPress={demoBringBack} />
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={[T.caption, { color: c.muted }]}>Where you are</Text>
              <Segmented<string>
                options={[
                  { label: 'Out and about', value: 'none' },
                  { label: 'Home', value: 'home' },
                  { label: 'Office', value: 'office' },
                ]}
                value={s.currentPlace ?? 'none'}
                onChange={v => demoSetPlace(v === 'none' ? null : v)}
              />
            </View>

            <View style={{ gap: 8 }}>
              <Text style={[T.caption, { color: c.muted }]}>Ring battery</Text>
              <Segmented<string>
                options={[
                  { label: 'Normal', value: 'ok' },
                  { label: 'Low (8%)', value: 'low' },
                ]}
                value={s.batteryLow ? 'low' : 'ok'}
                onChange={v => demoSetBatteryLow(v === 'low')}
              />
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

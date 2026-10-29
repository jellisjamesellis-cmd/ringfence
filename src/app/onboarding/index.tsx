import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { Button } from '@/components/ui';
import { WearableVisual } from '@/components/WearableVisual';
import { alarm, type as T } from '@/lib/theme';

const SLIDES: { kicker: string; title: string; body: string; icon?: IconName }[] = [
  {
    kicker: 'The problem',
    title: 'A snatched phone is a key to your whole life.',
    body: 'Thieves get into banking apps, take out loans in your name and go through your photos, often within the hour.',
    icon: 'run',
  },
  {
    kicker: 'How it works',
    title: 'Your ring keeps your phone honest.',
    body: 'Your phone stays paired to a ring on your finger. If the phone is taken more than a few metres away, the apps you choose lock and your accounts freeze.',
  },
  {
    kicker: 'Getting back in',
    title: 'Only you can undo it.',
    body: 'Unlocking needs the ring next to the phone, your face, and a check with your bank. A phone on its own gets a thief nowhere.',
    icon: 'shieldCheck',
  },
];

export default function Welcome() {
  const c = alarm;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const last = page === SLIDES.length - 1;

  const next = () => {
    if (last) router.push('/onboarding/pair');
    else scroller.current?.scrollTo({ x: width * (page + 1), animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 12 }}>
      <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 4.5, borderColor: c.ink }} />
        <Text style={{ color: c.ink, fontSize: 18, fontWeight: '700', letterSpacing: 0.3 }}>Ringfence</Text>
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}>
        {SLIDES.map((s, i) => (
          <View key={s.kicker} style={{ width, paddingHorizontal: 24, justifyContent: 'center', gap: 28 }}>
            <View style={{ height: 200, alignItems: 'flex-start', justifyContent: 'center' }}>
              {i === 1 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 78,
                      height: 150,
                      borderRadius: 18,
                      borderWidth: 3,
                      borderColor: c.ink,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Icon name="lock" size={30} color={c.accent} strokeWidth={2} />
                  </View>
                  <View style={{ width: 54, borderTopWidth: 2, borderStyle: 'dashed', borderColor: c.accent }} />
                  <WearableVisual type="ring" size={92} led={c.accent} pulse metal={c.metal} metalHi={c.metalHi} />
                </View>
              ) : (
                <View
                  style={{
                    width: 132,
                    height: 132,
                    borderRadius: 36,
                    backgroundColor: i === 0 ? c.alertBg : c.accentBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon name={s.icon ?? 'shield'} size={64} color={i === 0 ? c.alert : c.accent} strokeWidth={1.6} />
                </View>
              )}
            </View>
            <View style={{ gap: 12 }}>
              <Text style={[T.caption, { color: i === 0 ? c.alert : c.accent }]}>{s.kicker}</Text>
              <Text style={{ color: c.ink, fontSize: 32, lineHeight: 38, fontWeight: '700' }}>{s.title}</Text>
              <Text style={{ color: c.muted, fontSize: 17, lineHeight: 25 }}>{s.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 24, gap: 20 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{ width: i === page ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === page ? c.ink : c.surface2 }} />
          ))}
        </View>
        <Button title={last ? 'Set up my ring' : 'Continue'} onPress={next} palette={c} />
      </View>
    </View>
  );
}

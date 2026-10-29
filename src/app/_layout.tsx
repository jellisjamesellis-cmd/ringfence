import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';

import { DemoPanel } from '@/components/DemoPanel';
import { ProtectionOverlay } from '@/components/ProtectionOverlay';
import { startEngine } from '@/lib/engine';
import { hydrate } from '@/lib/store';
import { palettes } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = palettes[scheme];

  useEffect(() => {
    hydrate().then(() => {
      startEngine();
      SplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: c.bg, card: c.bg, text: c.ink, primary: c.accent, border: c.line },
  };

  return (
    <ThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen
              name="add-account"
              options={{ headerShown: true, title: 'Add an account', headerBackTitle: 'Back', headerShadowVisible: false }}
            />
            <Stack.Screen
              name="watch-link"
              options={{ headerShown: true, title: 'Connect your watch', headerBackTitle: 'Back', headerShadowVisible: false }}
            />
            <Stack.Screen
              name="trusted-contact"
              options={{ headerShown: true, title: 'Trusted contact', headerBackTitle: 'Back', headerShadowVisible: false }}
            />
          </Stack>
        <ProtectionOverlay />
        <DemoPanel />
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}

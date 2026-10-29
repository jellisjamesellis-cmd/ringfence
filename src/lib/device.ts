import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// ----- Haptics -----
export const haptic = {
  tap: () => Haptics.selectionAsync().catch(() => {}),
  impact: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
  /** A buzz pattern, used for "find my ring" and the lock moment. */
  async buzz(times = 3) {
    for (let i = 0; i < times; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      await wait(180);
    }
  },
};

// ----- Face ID -----
export type AuthResult = { ok: boolean; simulated: boolean };

/**
 * Uses real Face ID / Touch ID when the device has it set up.
 * Falls back to a simulated success (e.g. on web or a simulator) so the demo always works.
 */
export async function confirmIdentity(reason: string): Promise<AuthResult> {
  if (Platform.OS === 'web') {
    await wait(900);
    return { ok: true, simulated: true };
  }
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = hasHardware && (await LocalAuthentication.isEnrolledAsync());
    if (!enrolled) {
      await wait(900);
      return { ok: true, simulated: true };
    }
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: reason, cancelLabel: 'Cancel' });
    return { ok: res.success, simulated: false };
  } catch {
    await wait(900);
    return { ok: true, simulated: true };
  }
}

// ----- Notifications -----
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Not available on this platform.
}

export async function requestNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

export async function notify(title: string, body: string) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body, sound: true }, trigger: null });
  } catch {
    // Permission not granted or not supported here.
  }
}

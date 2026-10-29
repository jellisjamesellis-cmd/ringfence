# Ringfence

A prototype iPhone app for a wearable (ring or smartwatch) that protects you if your phone is snatched. When the phone and the wearable separate, chosen apps lock and bank accounts freeze. Getting back in needs the wearable next to the phone, Face ID, and a check with each bank.

**Everything external is simulated in this version:** the ring connection, the app locking and the bank freezes. Face ID, vibration and notifications are real.

## Run it on your iPhone

You need Node.js (version 20 or later) on your laptop, and the free **Expo Go** app on your iPhone.

```bash
npm install
npx expo install --fix   # lines every package up with the Expo SDK version
npx expo start
```

Scan the QR code with your iPhone camera and it opens in Expo Go. Your phone and laptop need to be on the same Wi-Fi. If they can't see each other (office Wi-Fi, for example), use `npx expo start --tunnel`.

## Try the theft demo

1. Go through setup: pair the ring, choose apps and accounts, set your rules.
2. On the Home tab, tap **Open demo controls**, or press and hold the Ringfence logo.
3. Tap **Snatch phone**. Watch the countdown, then the lock screen.
4. Tap **Unlock**, open **Demo** (top right) and tap **Bring ring back**, then use Face ID and unfreeze your accounts.

The demo controls also simulate being at a safe zone (Home or Office) and a low ring battery.

## How the code is laid out

| Path | What it is |
| --- | --- |
| `src/app/onboarding/` | Setup: welcome slides, pair, apps, accounts, rules, permissions, done |
| `src/app/(tabs)/` | Main tabs: Home, Protection, Ring, Activity, Settings |
| `src/components/ProtectionOverlay.tsx` | Countdown, lock screen and the 3-step recovery |
| `src/components/DemoPanel.tsx` | Hidden demo controls |
| `src/lib/engine.ts` | The protection logic: when to warn, lock and recover |
| `src/lib/store.ts` | App state, saved on the phone between launches |
| `src/lib/ring/` | The ring interface (`types.ts`) and the simulated ring (`mock.ts`) |
| `src/lib/catalog.ts` | The apps and accounts listed in the app |

## Connecting a real ring later

The app only talks to the ring through the `RingService` interface in `src/lib/ring/types.ts`. To use real hardware, write a Bluetooth version of that interface (for example with `react-native-ble-plx`) and swap it in `src/lib/ring/index.ts`. Bluetooth needs an Expo development build rather than Expo Go.

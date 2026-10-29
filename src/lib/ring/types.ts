/**
 * The contract every ring implementation follows.
 *
 * Today the app uses MockRing (simulated readings). When real hardware exists,
 * write a BleRing that implements this same interface (e.g. with react-native-ble-plx
 * in an Expo development build) and swap it in src/lib/ring/index.ts.
 * Nothing else in the app needs to change.
 */

export type Reading = {
  /** Estimated distance in metres. A real ring estimates this from Bluetooth signal strength. */
  distance: number;
  /** Bluetooth signal strength in dBm (closer to 0 is stronger). */
  rssi: number;
  /** Battery level, 0 to 1. */
  battery: number;
  /** Whether the Bluetooth link is currently up. */
  connected: boolean;
};

export type FoundDevice = {
  id: string;
  name: string;
  model: string;
  rssi: number;
};

export type Unsubscribe = () => void;

export interface RingService {
  /** Look for nearby rings that are in pairing mode. */
  scan(): Promise<FoundDevice[]>;
  /** Pair with a ring found by scan(). */
  pair(id: string): Promise<void>;
  /** Restore a pairing saved from a previous session. */
  restore(id: string): void;
  unpair(): void;
  /** Receive a reading roughly twice a second, and immediately on change. */
  subscribe(listener: (r: Reading) => void): Unsubscribe;
  current(): Reading;
  /** Make the ring vibrate so the owner can find it. */
  find(): Promise<void>;
}

/** Controls only the simulated ring offers, used by the demo panel. */
export interface DemoControls {
  setDistance(d: number): void;
  moveTo(d: number, ms: number): void;
  setBatteryLow(low: boolean): void;
}

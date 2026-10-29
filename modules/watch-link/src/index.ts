import { requireOptionalNativeModule } from 'expo';

export type WatchDevice = { id: string; name: string; connected: boolean; rssi?: number };
export type BluetoothState = 'on' | 'off' | 'unauthorized' | 'unsupported' | 'resetting' | 'unknown' | 'notStarted';

type Subscription = { remove(): void };

type WatchLinkNative = {
  getState(): BluetoothState;
  findDevices(): Promise<WatchDevice[]>;
  watch(id: string): void;
  stop(): void;
  addListener(event: 'onState', cb: (e: { state: BluetoothState }) => void): Subscription;
  addListener(event: 'onConnection', cb: (e: { connected: boolean; id?: string; name?: string; reason?: string }) => void): Subscription;
  addListener(event: 'onRssi', cb: (e: { rssi: number }) => void): Subscription;
  addListener(event: 'onBattery', cb: (e: { level: number }) => void): Subscription;
};

/**
 * The native Bluetooth module. It's null inside Expo Go, which doesn't include custom native code;
 * the app then falls back to the simulated ring.
 */
export const WatchLink = requireOptionalNativeModule<WatchLinkNative>('WatchLink');
export const watchLinkAvailable = WatchLink != null;

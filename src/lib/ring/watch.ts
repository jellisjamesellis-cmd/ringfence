import { WatchLink, type BluetoothState, type WatchDevice } from '../../../modules/watch-link/src';
import type { FoundDevice, Reading, RingService } from './types';

export type LinkEvent = { ts: number; text: string; kind: 'ok' | 'alert' | 'info' };

/**
 * A real watch (e.g. Polar Vantage) used as the "ring".
 * Distance is estimated from Bluetooth signal strength, so treat it as rough: good for
 * "next to me" versus "down the street", not for exact metres.
 */
export class WatchRing implements RingService {
  private reading: Reading = { distance: 0, rssi: -100, battery: 1, connected: false };
  private smoothed: number | null = null;
  private listeners = new Set<(r: Reading) => void>();
  private infoListeners = new Set<() => void>();
  /** Signal strength measured at about 1 m. Calibrate() refines it for this watch and wrist. */
  rssiAt1m = -62;
  private readonly pathLoss = 2.2;

  bluetooth: BluetoothState = 'notStarted';
  deviceName: string | null = null;
  history: LinkEvent[] = [];
  disconnects = 0;

  constructor() {
    if (!WatchLink) return;
    WatchLink.addListener('onState', e => {
      this.bluetooth = e.state;
      this.note(`Bluetooth ${e.state}`, e.state === 'on' ? 'info' : 'alert');
    });
    WatchLink.addListener('onConnection', e => {
      const was = this.reading.connected;
      this.reading = { ...this.reading, connected: e.connected };
      if (e.connected) {
        if (e.name) this.deviceName = e.name;
        this.note(`Connected to ${e.name ?? 'watch'}`, 'ok');
      } else {
        this.smoothed = null;
        if (was) this.disconnects += 1;
        this.note(`Disconnected${e.reason ? `: ${e.reason}` : ''}`, 'alert');
      }
      this.emit();
    });
    WatchLink.addListener('onRssi', e => {
      const next = this.smoothed == null ? e.rssi : this.smoothed * 0.7 + e.rssi * 0.3;
      this.smoothed = next;
      const rssi = Math.round(next);
      this.reading = { ...this.reading, rssi, distance: this.distanceFor(rssi), connected: true };
      this.emit();
    });
    WatchLink.addListener('onBattery', e => {
      this.reading = { ...this.reading, battery: Math.max(0, Math.min(1, e.level / 100)) };
      this.emit();
    });
  }

  private distanceFor(rssi: number) {
    const d = Math.pow(10, (this.rssiAt1m - rssi) / (10 * this.pathLoss));
    return Math.max(0, Math.min(30, d));
  }

  private note(text: string, kind: LinkEvent['kind']) {
    this.history = [{ ts: Date.now(), text, kind }, ...this.history].slice(0, 40);
    this.infoListeners.forEach(l => l());
  }

  private emit() {
    this.listeners.forEach(l => l(this.reading));
    this.infoListeners.forEach(l => l());
  }

  /** For the test screen: re-render on any change. */
  onInfo(l: () => void) {
    this.infoListeners.add(l);
    return () => {
      this.infoListeners.delete(l);
    };
  }

  /** Hold the phone right next to the watch, then call this. */
  calibrate() {
    if (!this.reading.connected) return false;
    // Treat the current reading as roughly 0.3 m away.
    this.rssiAt1m = Math.round(this.reading.rssi - 10 * this.pathLoss * Math.log10(1 / 0.3));
    this.note(`Calibrated: ${this.reading.rssi} dBm next to the phone`, 'info');
    this.emit();
    return true;
  }

  async findDevices(): Promise<WatchDevice[]> {
    if (!WatchLink) return [];
    const list = await WatchLink.findDevices();
    const score = (d: WatchDevice) => (d.connected ? 2 : 0) + (/polar/i.test(d.name) ? 1 : 0);
    return list.sort((a, b) => score(b) - score(a));
  }

  // ----- RingService -----

  async scan(): Promise<FoundDevice[]> {
    const list = await this.findDevices();
    return list.map(d => ({ id: d.id, name: d.name, model: d.connected ? 'Connected to this iPhone' : 'Nearby', rssi: d.rssi ?? -60 }));
  }

  async pair(id: string) {
    this.restore(id);
  }

  restore(id: string) {
    if (!WatchLink) return;
    this.note('Following watch', 'info');
    WatchLink.watch(id);
  }

  unpair() {
    WatchLink?.stop();
    this.reading = { ...this.reading, connected: false };
    this.note('Stopped following watch', 'info');
    this.emit();
  }

  subscribe(listener: (r: Reading) => void) {
    this.listeners.add(listener);
    listener(this.reading);
    return () => {
      this.listeners.delete(listener);
    };
  }

  current() {
    return this.reading;
  }

  async find() {
    // Watches don't let other apps make them vibrate.
  }
}

import type { DemoControls, FoundDevice, Reading, RingService } from './types';

const OUT_OF_RANGE_M = 12;

/** Signal strength falls off with distance, roughly like real Bluetooth LE. */
function rssiFor(distance: number) {
  return Math.round(-45 - 20 * Math.log10(Math.max(distance, 0.25) / 0.25));
}

export class MockRing implements RingService, DemoControls {
  private distance = 0.4;
  private battery = 0.82;
  private paired = false;
  private listeners = new Set<(r: Reading) => void>();
  private tween: ReturnType<typeof setInterval> | null = null;

  constructor() {
    setInterval(() => this.emit(), 500);
  }

  current(): Reading {
    const jitter = (Math.random() - 0.5) * Math.min(0.4, 0.06 + this.distance * 0.02);
    const distance = Math.max(0, this.distance + jitter);
    return {
      distance,
      rssi: rssiFor(distance),
      battery: this.battery,
      connected: this.paired && distance < OUT_OF_RANGE_M,
    };
  }

  private emit() {
    if (this.paired) this.battery = Math.max(0.01, this.battery - 0.000015);
    const r = this.current();
    this.listeners.forEach(l => l(r));
  }

  subscribe(listener: (r: Reading) => void) {
    this.listeners.add(listener);
    listener(this.current());
    return () => {
      this.listeners.delete(listener);
    };
  }

  scan(): Promise<FoundDevice[]> {
    return new Promise(resolve =>
      setTimeout(
        () => resolve([{ id: 'RF-R1-7A3C', name: 'Ringfence Ring', model: 'R1 · Size 9', rssi: -52 }]),
        2400,
      ),
    );
  }

  pair(_id: string): Promise<void> {
    return new Promise(resolve =>
      setTimeout(() => {
        this.paired = true;
        this.distance = 0.4;
        this.emit();
        resolve();
      }, 1600),
    );
  }

  restore(_id: string) {
    this.paired = true;
    this.emit();
  }

  unpair() {
    this.paired = false;
    this.emit();
  }

  find(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 3000));
  }

  // ----- Demo-only controls -----

  setDistance(d: number) {
    if (this.tween) clearInterval(this.tween);
    this.tween = null;
    this.distance = Math.max(0, Math.min(30, d));
    this.emit();
  }

  moveTo(target: number, ms: number) {
    if (this.tween) clearInterval(this.tween);
    const from = this.distance;
    const start = Date.now();
    this.tween = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / ms);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      this.distance = from + (target - from) * e;
      this.emit();
      if (p >= 1 && this.tween) {
        clearInterval(this.tween);
        this.tween = null;
      }
    }, 80);
  }

  setBatteryLow(low: boolean) {
    this.battery = low ? 0.08 : 0.82;
    this.emit();
  }
}

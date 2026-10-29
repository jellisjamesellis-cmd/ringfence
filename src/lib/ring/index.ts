import { watchLinkAvailable } from '../../../modules/watch-link/src';
import { MockRing } from './mock';
import type { FoundDevice, Reading, RingService } from './types';
import { WatchRing } from './watch';

export type RingSource = 'simulated' | 'watch';

/**
 * The app talks to one ring. This router forwards to either the simulated ring
 * or the real watch, so the rest of the app doesn't care which is in use.
 */
class RingRouter implements RingService {
  source: RingSource = 'simulated';
  private listeners = new Set<(r: Reading) => void>();

  constructor(
    private sim: MockRing,
    private real: WatchRing | null,
  ) {
    sim.subscribe(r => this.source === 'simulated' && this.emit(r));
    real?.subscribe(r => this.source === 'watch' && this.emit(r));
  }

  private get active(): RingService {
    return this.source === 'watch' && this.real ? this.real : this.sim;
  }

  private emit(r: Reading) {
    this.listeners.forEach(l => l(r));
  }

  setSource(s: RingSource) {
    this.source = s === 'watch' && this.real ? 'watch' : 'simulated';
    this.emit(this.active.current());
  }

  scan(): Promise<FoundDevice[]> {
    return this.active.scan();
  }
  pair(id: string) {
    return this.active.pair(id);
  }
  restore(id: string) {
    this.active.restore(id);
  }
  unpair() {
    this.active.unpair();
  }
  subscribe(listener: (r: Reading) => void) {
    this.listeners.add(listener);
    listener(this.active.current());
    return () => {
      this.listeners.delete(listener);
    };
  }
  current() {
    return this.active.current();
  }
  find() {
    return this.active.find();
  }
}

const mock = new MockRing();
export const watchRing = watchLinkAvailable ? new WatchRing() : null;
export const ring = new RingRouter(mock, watchRing);
export const demo = mock;
export { watchLinkAvailable };
export type { Reading, FoundDevice } from './types';

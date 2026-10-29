import { MockRing } from './mock';

/**
 * The one place the app chooses its ring implementation.
 * Swap MockRing for a real Bluetooth implementation of RingService later.
 */
const mock = new MockRing();

export const ring = mock;
export const demo = mock;
export type { Reading, FoundDevice } from './types';

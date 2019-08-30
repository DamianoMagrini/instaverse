/// <reference path="index.d.ts" />

/**
 * @module random-utils
 *
 * Utilities for generating randomness.
 *
 * Dependencies:
 *  - alea (former 14876719, now node_module)
 *  - config (9568270)
 */

import Alea from 'alea';
import * as config from './9568270_config';

const RANDOM_FRACTION_DENOMINATOR = 4294967296;

let alea = null;

function get_alea_instance(): {
  (): number;
  uint32(): number;
  fract53(): number;
  version: string;
  args: any[];
  exportState(): [number, number, number, number];
  importState(state: [number, number, number, number]): void;
} {
  if (!alea) alea = Alea(config.getNonce());
  return alea;
}

function random_uint32(): number {
  if (typeof window !== 'undefined' && window.Uint32Array !== undefined) {
    const window_crypto = window.crypto || window.msCrypto;
    if (window_crypto && window_crypto.getRandomValues) {
      const random_values_array = new window.Uint32Array(1);
      window_crypto.getRandomValues(random_values_array);
      return random_values_array[0];
    }
  }

  return get_alea_instance().uint32();
}

function random_fraction() {
  return random_uint32() / RANDOM_FRACTION_DENOMINATOR;
}

export const randomUint32 = random_uint32;
export const randomFraction = random_fraction;
export const coinflip = (probability: number) =>
  probability !== 0 &&
  (probability <= 1 || random_fraction() * probability <= 1);

/**
 * @module normalize-and-truncate
 *
 * Normalizes a number, then rounds it down to the nearest integer.
 *
 * Dependencies:
 *  - normalize-number (9764883)
 */

import normalize_number from './9764883_normalize-number';

const normalize_and_truncate = (number: number | any) => {
  const normalized = normalize_number(number);
  const decimal_part = normalized % 1;

  //? Why check if normalized is not NaN? The normalizer turns NaNs into 0s.
  return normalized === normalized
    ? decimal_part
      ? normalized - decimal_part
      : normalized
    : 0;
};

export default normalize_and_truncate;

/**
 * @module normalize-number
 *
 * Normalizes anormal numbers, such as NaN (into 0), +Infinity (into the
 * positive double limit) and -Infinity (into the negative double limit).
 *
 * Dependencies:
 *  - to-number (14876676)
 */

import to_number from './14876676_to-number';

const DOUBLE_LIMIT = 1.7976931348623157e308;

const normalize_number = (number: number | any) => {
  if (!number) return number === 0 ? number : 0;

  number = to_number(number);
  if (number === Infinity || number === -Infinity)
    return (number < 0 ? -1 : 1) * DOUBLE_LIMIT;

  // If the number is NaN, return 0
  return number === number ? number : 0;
};

export default normalize_number;

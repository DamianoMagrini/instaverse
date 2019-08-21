/**
 * @module to-number
 *
 * Convert anything into a number.
 *
 * Dependencies
 *  - is-symbol (14876677)
 *  - is-function-or-object (9699363)
 */

import is_symbol from './14876677_is-symbol';
import is_function_or_object from './9699363_is-function-or-object';

const WHITESPACE = /^\s+|\s+$/g;

const IS_HEX = /^[-+]0x[0-9a-f]+$/i;
const IS_BIN = /^0b[01]+$/i;
const IS_OCT = /^0o[0-7]+$/i;

const to_number = (raw_number: any) => {
  if (typeof raw_number === 'number') return raw_number;
  if (is_symbol(raw_number)) return NaN;

  if (is_function_or_object(raw_number)) {
    const raw_number_value =
      typeof raw_number.valueOf === 'function'
        ? raw_number.valueOf()
        : raw_number;

    raw_number = is_function_or_object(raw_number_value)
      ? raw_number_value + ''
      : raw_number_value;
  }

  if (typeof raw_number !== 'string')
    return 0 === raw_number ? raw_number : +raw_number;

  // Remove whitespace
  raw_number = raw_number.replace(WHITESPACE, '');

  var is_binary = IS_BIN.test(raw_number);
  return is_binary || IS_OCT.test(raw_number)
    ? parseInt(raw_number.slice(2), is_binary ? 2 : 8)
    : IS_HEX.test(raw_number)
    ? NaN
    : Number(raw_number);
};

export default to_number;

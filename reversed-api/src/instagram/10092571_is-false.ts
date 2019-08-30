/**
 * @module is-false
 *
 * Returns true if the value that was passed in is non-primitive and empty, or
 * primitive and resolves to false when converted to boolean, and false
 * otherwise. Throws an error if it is a non-iterable object.
 *
 * Dependencies:
 *  - invariant-ex (9502825)
 */

import invariant_ex from './9502825_invariant-ex';

function is_iterable(value: any) {
  return typeof Symbol !== 'undefined' && value[Symbol.iterator];
}

const is_false = (value: any) => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    if (value) {
      invariant_ex(!is_iterable(value) || value.size === undefined);
      for (const key in value) return false;
    }
    return true;
  }
  return !value;
};

export default is_false;

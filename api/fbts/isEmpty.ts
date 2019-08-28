import invariant from './invariant';

/**
 * Checks if a value is empty.
 */
function isEmpty(value: any): boolean {
  if (value instanceof Array) {
    return value.length === 0;
  } else if (typeof value === 'object') {
    if (value) {
      invariant(
        !isIterable(value) || 'size' in value,
        'isEmpty() does not support iterable collections.'
      );

      for (const _ in value) {
        return false;
      }
    }

    return true;
  } else {
    return !value;
  }
}

function isIterable(value: any): boolean {
  if (typeof Symbol === 'undefined') {
    return false;
  }

  return value[Symbol.iterator];
}

export default isEmpty;

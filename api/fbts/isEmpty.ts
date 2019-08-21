import invariant from './invariant';

/**
 * Checks if a value is empty.
 */
function isEmpty(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  } else if (typeof value === 'object') {
    if (value) {
      invariant(
        !isIterable(value) || value.size === undefined,
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

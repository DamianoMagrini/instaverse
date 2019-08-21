import Set from './Set';

import everySet from './everySet';

/**
 * Checks if two sets are equal
 */
function equalsSet<T>(one: Set<T>, two: Set<T>): boolean {
  if (one.size !== two.size) {
    return false;
  }

  return everySet(one, (value) => two.has(value));
}

export default equalsSet;

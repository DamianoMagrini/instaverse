import Set from './Set';

import emptyFunction from './emptyFunction';

/**
 * Returns the count of distinct elements selected from an array.
 */
function countDistinct<T1, T2>(
  iter: Iterable<T1>,
  selector: (item: T1) => T2
): number {
  selector = selector || emptyFunction.thatReturnsArgument;
  var set = new Set();

  for (var val of iter) {
    set.add(selector(val));
  }

  return set.size;
}

export default countDistinct;

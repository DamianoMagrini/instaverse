import Set from './Set';

/**
 * The everySet() method tests whether all elements in the given Set pass the
 * test implemented by the provided function.
 */
function everySet<T>(
  set: Set<T>,
  callback: (value: T, key: T, set: Set<T>) => boolean,
  context?: any
): boolean {
  var iterator = set.entries();
  var current = iterator.next();

  while (!current.done) {
    var entry = current.value;

    if (!callback.call(context, entry[1], entry[0], set)) {
      return false;
    }

    current = iterator.next();
  }

  return true;
}

export default everySet;
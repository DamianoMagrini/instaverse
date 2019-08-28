import forEachObject from './forEachObject';

/**
 * Partitions an object given a predicate. All elements satisfying the predicate
 * are part of the first returned object, and all elements that don't are in the
 * second.
 */
function partitionObject<ValueType>(
  object: { [key: string]: ValueType },
  get_partition: (
    value: ValueType,
    key: string,
    object: { [key: string]: ValueType }
  ) => boolean,
  thisArg?: any
): [{ [key: string]: ValueType }, { [key: string]: ValueType }] {
  const first = {};
  const second = {};

  forEachObject(object, (value, key) => {
    if (get_partition.call(thisArg, value, key, object)) first[key] = value;
    else second[key] = value;
  });

  return [first, second];
}

export default partitionObject;

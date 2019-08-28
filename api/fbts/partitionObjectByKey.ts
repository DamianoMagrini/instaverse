import Set from './Set';

import partitionObject from './partitionObject';

/**
 * Partitions the enumerable properties of an object into two objects, given a
 * whitelist `Set` for the first object. This is comparable to
 * `whitelistObjectKeys`, but eventually keeping all the keys. Returns a tuple
 * of objects `[first, second]`.
 */
const partitionObjectByKey = (
  source: { [key: string]: any },
  whitelist: Set<string>
): [{ [key: string]: any }, { [key: string]: any }] =>
  partitionObject(source, (value, key) => whitelist.has(key));

export default partitionObjectByKey;

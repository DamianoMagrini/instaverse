/**
 * @module cached
 *
 * Dependencies:
 *  - corejs/es6/map (former 14876683, now node_module)
 */

import Map from 'core-js/es6/map';

const EXPECTED_FUNCTION_ERROR = 'Expected a function';

cached.Cache = Map;

function cached<Arguments extends Array<any>, Result>(
  function_to_cache: (...args: Arguments) => Result,
  index_generator?: (...args: Arguments) => any
) {
  if (
    typeof function_to_cache !== 'function' ||
    (index_generator !== null && typeof index_generator !== 'function')
  )
    throw new TypeError(EXPECTED_FUNCTION_ERROR);

  const cached_function = function(...args: Arguments) {
    const key = index_generator ? index_generator.apply(this, args) : args[0];
    const cache = cached_function.cache;

    // If the value is present in cache, get it from there.
    if (cache.has(key)) return cache.get(key);

    // Otherwise, call the original function and save the cache the result.
    const result = function_to_cache.apply(this, args);
    cached_function.cache = cache.set(key, result) || cache;
    return result;
  };

  //? Ahem.
  cached_function.cache = new (cached.Cache || Map)();

  return cached_function;
}

export default cached;

/**
 * @module precache
 *
 * Evaluates a function that takes in no arguments, then caches its result.
 *
 * Dependencies:
 *  - invariant-ex (9502825)
 */

import invariant_ex from './9502825_invariant-ex';

const precache = <Result>(function_to_cache: () => Result) => {
  let last_result: Result;
  let current_function = function_to_cache;

  return (...args: []) => {
    invariant_ex(!args.length);
    if (current_function) {
      last_result = current_function();
      current_function = null;
    }
    return last_result;
  };
};

export default precache;

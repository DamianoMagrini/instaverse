/**
 * @module limited-generator
 *
 * Dependencies:
 *  - normalize-and-truncate (12255370)
 */

import normalize_and_truncate from './12255370_normalize-and-truncate';

const EXPECTED_FUNCTION_ERROR = 'Expected a function';

const limited_generator = <Arguments extends Array<any>, Result>(
  iterations: number | any,
  generator: (...args: Arguments) => Result
): ((...args: Arguments) => Result) => {
  if (typeof generator != 'function')
    throw new TypeError(EXPECTED_FUNCTION_ERROR);

  iterations = normalize_and_truncate(iterations);

  let last_value: any;
  return function(...args: Arguments): Result {
    iterations--;
    if (iterations >= 1) last_value = generator.apply(this, ...args);
    if (iterations <= 1) generator = undefined;
    return last_value;
  };
};

export default limited_generator;

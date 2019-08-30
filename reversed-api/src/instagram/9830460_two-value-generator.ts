/**
 * @module two-value-generator
 *
 * Dependencies
 *  - limited-generator (14876675)
 */

import limited_generator from './14876675_limited-generator';

const two_value_generator = <Arguments extends Array<any>, Result>(
  generator_function: (...args: Arguments) => Result
): ((...args: Arguments) => Result) => limited_generator(2, generator_function);

export default two_value_generator;

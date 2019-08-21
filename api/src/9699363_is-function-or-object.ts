/**
 * @module is-function-or-object
 *
 * Determines if a value is a non-null object or a function.
 *
 * Dependencies: none
 */

const is_function_or_object = (value: any): value is Function | object =>
  null !== value && (typeof value === 'object' || typeof value === 'function');

export default is_function_or_object;

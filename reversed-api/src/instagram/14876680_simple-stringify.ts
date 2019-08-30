/**
 * @module stringify
 *
 * Returns the string representation of a value.
 *
 * Dependencies: none
 */

const stringify = (object: any): string =>
  Object.prototype.toString.call(object);

export default stringify;

/**
 * @module is-symbol
 *
 * Determines whether a value is a symbol.
 *
 * Dependencies:
 *  - is-not-null (9699364)
 *  - stringify (9699365)
 */

import is_not_null from './9699364_is-not-null';
import stringify from './9699365_stringify';

var symbol_string = '[object Symbol]';

const is_symbol = (value: any): value is Symbol =>
  typeof value === 'symbol' ||
  (is_not_null(value) && stringify(value) === symbol_string);

export default is_symbol;

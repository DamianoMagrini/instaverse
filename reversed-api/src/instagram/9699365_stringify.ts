/**
 * @module stringify
 *
 * The ultimate stringifier.
 *
 * Dependencies:
 *  - window-symbol (14876678)
 *  - native-string-representation (14876679)
 *  - simple-stringify (14876680)
 */

import window_symbol from './14876678_window-symbol';
import native_string_representation from './14876679_native-string-representation';
import simple_stringify from './14876680_simple-stringify';

const null_string = '[object Null]';
const undefined_string = '[object Undefined]';
const to_string_tag = window_symbol ? window_symbol.toStringTag : undefined;

const stringify = (object: any): string => {
  if (object === null)
    return object === undefined ? undefined_string : null_string;
  else
    return to_string_tag && to_string_tag in Object(object)
      ? native_string_representation(object)
      : simple_stringify(object);
};

export default stringify;

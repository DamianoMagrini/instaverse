/**
 * @module native-string-representation
 *
 * Returns the native string representation of an object, ignoring
 * Symbol.toStringTag, if any.
 *
 * Dependencies:
 *  - window-symbol
 */

import window_symbol from './14876678_window-symbol';

const to_string_tag = window_symbol ? window_symbol.toStringTag : undefined;

const native_string_representation = (object: any): string => {
  const object_has_to_string_tag = Object.prototype.hasOwnProperty.call(
    object,
    to_string_tag
  );
  const object_to_string_tag = object[to_string_tag];

  try {
    object[to_string_tag] = undefined;
  } catch {}

  var object_string = Object.prototype.toString.call(object);

  if (object_has_to_string_tag) object[to_string_tag] = object_to_string_tag;
  else delete object[to_string_tag];

  return object_string;
};

export default native_string_representation;

/**
 * @module get-string
 *
 * Returns a localized string from the database.
 *
 * Dependencies:
 *  - apply-phonological-transformations (14876713)
 *  - localization (65537)
 */

import apply_phonological_transformations from './14876713_apply-phonological-transformations';
import * as localization from './65537_localization';

function get_string(
  string_index: number,
  transformations?: { [key: string]: string | object }
) {
  return transformations !== undefined
    ? apply_phonological_transformations(
        localization.strs[string_index],
        transformations
      )
    : localization.strs[string_index];
}

/**
 * If the translation in a language is not complete, this function allows
 * specifying a fallback string.
 */
get_string.getStringDev = function(
  string_index: number,
  transformations?: { [key: string]: string | object },
  fallback_string?: string
) {
  const localized_string =
    string_index !== null && localization.strs[string_index]
      ? localization.strs[string_index]
      : fallback_string;
  return transformations !== null
    ? apply_phonological_transformations(localized_string, transformations)
    : localized_string;
};

export default get_string;

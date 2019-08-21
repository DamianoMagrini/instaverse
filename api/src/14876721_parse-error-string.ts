/**
 * @module parse-error-string
 *
 * Parse an error string encoded by ex (9502826), and return the call stack as
 * an array.
 *
 * Dependencies:
 *  - ex (9502826)
 */

import ex from './9502826_ex';

const parse_error_string = (error: string) => {
  if (typeof error !== 'string') return error;

  const error_prefix_index = error.indexOf(ex._prefix);
  const error_suffix_index = error.lastIndexOf(ex._suffix);
  if (error_prefix_index < 0 || error_suffix_index < 0) return [error];

  const error_index = error_prefix_index + ex._prefix.length;
  const error_suffix_end_index = error_suffix_index + ex._suffix.length;

  if (error_index >= error_suffix_index)
    return ['erx slice failure: %s', error];

  const string_before_error = error.substring(0, error_prefix_index);
  const string_after_error = error.substring(error_suffix_end_index);

  error = error.substring(error_index, error_suffix_index);

  let parsed_error: string[];
  try {
    parsed_error = JSON.parse(error) as string[];
    parsed_error[0] =
      string_before_error + parsed_error[0] + string_after_error;
  } catch {
    return ['erx parse failure: %s', error];
  }

  return parsed_error;
};

export default parse_error_string;

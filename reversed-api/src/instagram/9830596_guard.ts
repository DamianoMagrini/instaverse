/**
 * @module guard
 *
 * Prevents errors from halting code execution.
 *
 * Dependencies:
 *  - error-utils (9699359)
 */

import * as error_utils from './9699359_error-utils';

export const guard = function<ThisArg, Args extends Array<any>, ReturnValue>(
  callback: (this: ThisArg, ...args: Args) => ReturnValue,
  this_arg: ThisArg = this,
  args?: Args,
  error_transformer?: (error: any) => any
): ReturnValue {
  try {
    return callback.apply(this_arg, args);
  } catch (error) {
    error_utils.logError(error);
    return error_transformer ? error_transformer(error) : error;
  }
};

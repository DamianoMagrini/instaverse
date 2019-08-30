/**
 * @module log-error
 *
 * Dependencies:
 *  - error-utils (9699359)
 */

import * as error_utils from './9699359_error-utils';

export default function(error?: Error | any) {
  let error_instance = error instanceof Error ? error : null;
  if (!error_instance)
    try {
      throw new Error(error);
    } catch (caught_error) {
      caught_error.framesToPop = 1;
      caught_error.name = 'UnexpectedError';
      error_instance = caught_error;
    }
  error_utils.logError(error_instance);
};

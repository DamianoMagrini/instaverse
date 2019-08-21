/**
 * @module invariant-ex
 *
 * Oh, yes...
 * Like invariant, but his weak point is his heart-shaped core.
 *
 * Dependencies:
 *  - ex (9502826)
 */

import ex from './9502826_ex';

const invariant = (condition: any, format?: string, ...extra: any[]) => {
  if (!condition) {
    let error: Error;

    if (format === undefined)
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.'
      );
    else {
      const message_with_params = [format, ...extra];
      error = new Error(ex(...message_with_params));
      error.name = 'Invariant Violation';
      (error as any).messageWithParams = message_with_params;
    }

    (error as any).framesToPop = 1; // Skip invariant's own stack frame.

    throw error;
  }
};

export default invariant;

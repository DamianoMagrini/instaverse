declare var __DEV__: boolean;

import emptyFunction from './emptyFunction';

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */
function printWarning(format: string, ...args: string[]) {
  var argIndex = 0;
  var message = 'Warning: ' + format.replace(/%s/g, () => args[argIndex++]);

  if (typeof console !== 'undefined') {
    console.error(message);
  }

  try {
    // --- Welcome to debugging React ---
    // This error was thrown as a convenience so that you can use this stack
    // to find the callsite that caused this warning to fire.

    // Thank you! 😁👌
    throw new Error(message);
  } catch (x) {}
}

var warning = __DEV__
  ? function(condition: any, format: string, ...args: string[]) {
      if (format === undefined) {
        throw new Error(
          '`warning(condition, format, ...args)` requires a warning ' +
            'message argument'
        );
      }

      if (!condition) {
        printWarning(format, ...args);
      }
    }
  : emptyFunction; // Ah... I get it now
export default warning;

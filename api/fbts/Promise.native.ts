import Promise from 'promise';

import 'promise/setimmediate/done';

/**
 * Handle either fulfillment or rejection with the same callback.
 */
Promise.prototype.finally = function(onSettled) {
  return this.then(onSettled, onSettled);
};

export default Promise;

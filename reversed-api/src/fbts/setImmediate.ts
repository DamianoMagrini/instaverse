// setimmediate adds setImmediate to the global. We want to make sure we export
// the actual function.

import 'setimmediate';

declare function setImmediate<Args extends Array<any>>(
  callback: string | { (...args: Args): void },
  ...args: Args
): void;

export default setImmediate;

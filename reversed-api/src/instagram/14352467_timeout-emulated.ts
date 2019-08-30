/**
 * @module timeout-emulated
 *
 * Almost equivalent to timeout-extended, but bound to the emulated event loop.
 *
 * Dependencies:
 *  - event-loop (9830455)
 *  - timeout-extended (10289231)
 */

import event_loop from './9830455_event-loop';
import timeout_extended from './10289231_timeout-extended';

export default <ThisArg, Args extends Array<any>>(
  handler: { (this: ThisArg, ...args: Args): void; __SMmeta?: any },
  delay: number,
  this_arg?: ThisArg
) =>
  timeout_extended(
    handler,
    delay,
    this_arg,
    event_loop.setTimeout,
    event_loop.clearTimeout
  );

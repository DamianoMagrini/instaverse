/**
 * @module timeout-extended
 *
 * A timeout function that can be rerun infinitely, as it includes a reset
 * function that clears the previously run timeout and allows to start another.
 *
 * Dependencies: none
 */

export default <ThisArg, Args extends Array<any>>(
  handler: { (this: ThisArg, ...args: Args): void; __SMmeta?: any },
  delay: number,
  this_arg: ThisArg,
  set_timeout?: (handler: TimerHandler, delay: number) => number,
  clear_timeout?: (id: number) => void
) => {
  set_timeout = set_timeout || setTimeout;
  clear_timeout = clear_timeout || clearTimeout;

  let timeout_id: number;

  const timeout = (...args: Args) => {
    timeout.reset();
    const callback = () => {
      handler.apply(this_arg, args);
    };
    callback.__SMmeta = handler.__SMmeta;
    timeout_id = set_timeout(callback, delay);
  };

  timeout.reset = () => {
    clear_timeout(timeout_id);
  };

  return timeout;
};

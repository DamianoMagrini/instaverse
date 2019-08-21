/**
 * @module get-current-timestamp
 *
 * Get the current timestamp by summing the time at which navigation started
 * and performance.now(), the time elapsed since then.
 * If performance.timing.navigationStart is undefined, fall back on Date.now().
 *
 * Dependencies:
 *  - performance-object (14942219)
 */

import performance from './14942219_performance-object';

let get_current_timestamp: () => number;

if (
  performance.now &&
  performance.timing &&
  performance.timing.navigationStart
) {
  const { navigationStart } = performance.timing;
  get_current_timestamp = () => navigationStart + performance.now();
} else get_current_timestamp = () => Date.now();

export default get_current_timestamp;

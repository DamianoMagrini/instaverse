/**
 * @module get-navigation-start-timestamp
 *
 * Returns the instant when navigation started (or 0 if window.performance.now
 * is undefined).
 *
 * Dependencies:
 *  - performance-object (14942219)
 */

import performance from './14942219_performance-object';

let get_navigation_start_timestamp: () => number;

if (performance.now)
  if (performance.timing && performance.timing.navigationStart)
    get_navigation_start_timestamp = () => performance.timing.navigationStart;
  else if (typeof window._cstart === 'number')
    get_navigation_start_timestamp = () => window._cstart;
  else {
    const now = Date.now();
    get_navigation_start_timestamp = () => now;
  }
else get_navigation_start_timestamp = () => 0;

export default get_navigation_start_timestamp;

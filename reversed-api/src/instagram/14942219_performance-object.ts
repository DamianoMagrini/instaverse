/// <reference path="index.d.ts" />

/**
 * @module performance-object
 *
 * Provides access to the window.performance object across multiple browsers.
 *
 * Dependencies:
 *  - environment-metadata (9502827)
 */

import environment_metadata from './9502827_environment-metadata';

let performance_object: Performance;
if (environment_metadata.canUseDOM)
  performance_object =
    window.performance || window.msPerformance || window.webkitPerformance;
export default performance_object || ({} as Performance);

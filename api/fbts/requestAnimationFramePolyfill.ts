/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule requestAnimationFramePolyfill
 */
import emptyFunction from './emptyFunction';

import nativeRequestAnimationFrame from './nativeRequestAnimationFrame';

var lastTime = 0;

var requestAnimationFrame =
  nativeRequestAnimationFrame ||
  function(callback) {
    var currTime = Date.now();
    var timeDelay = Math.max(0, 16 - (currTime - lastTime));
    lastTime = currTime + timeDelay;
    return global.setTimeout(function() {
      callback(Date.now());
    }, timeDelay);
  }; // Works around a rare bug in Safari 6 where the first request is never invoked.

requestAnimationFrame(emptyFunction);
export default requestAnimationFrame;

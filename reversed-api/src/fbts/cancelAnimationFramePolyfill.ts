/// <reference path="index.d.ts" />

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule cancelAnimationFramePolyfill
 */

/**
 * Here is the native and polyfill version of cancelAnimationFrame.
 * Please don't use it directly and use cancelAnimationFrame module instead.
 */
const cancelAnimationFrame =
  window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.oCancelAnimationFrame ||
  window.msCancelAnimationFrame ||
  window.clearTimeout;
export default cancelAnimationFrame;

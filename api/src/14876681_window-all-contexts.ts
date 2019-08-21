/**
 * @module window-all-contexts
 *
 * Export the window object, no matter the context (similar to `globalThis`).
 *
 * Dependencies:
 *  - window-if-global
 */

import window_if_global from './14876682_window-if-global';

const window_if_self: Window | false =
  typeof self === 'object' && self && self.Object === Object && self;
const window_all_contexts: Window =
  window_if_global || window_if_self || Function('return this')();

export default window_all_contexts;

/// <reference path="index.d.ts" />

/**
 * @module window-if-global
 *
 * Exports the window object in the global scope.
 *
 * Dependencies: none
 */

export default typeof window == 'object' &&
  window &&
  window.Object === Object &&
  window;

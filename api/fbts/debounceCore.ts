/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule debounceCore
 * @typechecks
 */

/**
 * Invokes the given callback after a specified number of milliseconds have
 * elapsed, ignoring subsequent calls.
 *
 * For example, if you wanted to update a preview after the user stops typing
 * you could do the following:
 *
 *   elem.addEventListener('keyup', debounce(this.updatePreview, 250), false);
 *
 * The returned function has a reset method which can be called to cancel a
 * pending invocation.
 *
 *   var debouncedUpdatePreview = debounce(this.updatePreview, 250);
 *   elem.addEventListener('keyup', debouncedUpdatePreview, false);
 *
 *   // later, to cancel pending calls
 *   debouncedUpdatePreview.reset();
 *
 * @param func - the function to debounce
 * @param wait - how long to wait in milliseconds
 * @param context - optional context to invoke the function in
 * @param setTimeoutFunc - an implementation of setTimeout
 *  if nothing is passed in the default setTimeout function is used
 * @param clearTimeoutFunc - an implementation of clearTimeout
 *  if nothing is passed in the default clearTimeout function is used
 */
function debounce(
  func: Function & any,
  wait: number,
  context: any,
  setTimeoutFunc: Function | null,
  clearTimeoutFunc: Function | null
) {
  setTimeoutFunc = setTimeoutFunc || setTimeout;
  clearTimeoutFunc = clearTimeoutFunc || clearTimeout;
  let timeout;

  function debouncer(...args) {
    debouncer.reset();

    const callback = function() {
      func.apply(context, args);
    };

    callback.__SMmeta = func.__SMmeta;
    timeout = setTimeoutFunc(callback, wait);
  }

  debouncer.reset = function() {
    clearTimeoutFunc(timeout);
  };

  return debouncer;
}

export default debounce;

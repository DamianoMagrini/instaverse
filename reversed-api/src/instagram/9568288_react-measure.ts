/**
 * @module react-measure
 *
 * Utilities to bind functions to React's update methods, to measure
 * performance.
 *
 * Dependencies:
 *  - react-dom (formerly 4, now node_module)
 */

import ReactDOM from 'react-dom';

let busy = false;

const measure_callbacks: (() => void)[] = [];
const mutate_callbacks: (() => void)[] = [];

const remaining_callbacks = () =>
  measure_callbacks.length || mutate_callbacks.length;

function flush_on_next_frame() {
  if (!busy) {
    requestAnimationFrame(() => _flush());
    busy = true;
  }
}

function call_all(callback_array: (() => void)[]) {
  while (callback_array.length !== 0) callback_array.shift()();
}

export const _flush = (skip_frame = false) => {
  let last_error: Error = null;
  try {
    while (remaining_callbacks()) {
      ReactDOM.unstable_batchedUpdates(() => {
        call_all(mutate_callbacks);
      });
      call_all(measure_callbacks);
    }
  } catch (error) {
    last_error = error;
  }
  busy = false;
  if (last_error) {
    if (remaining_callbacks() && !skip_frame) flush_on_next_frame();
    throw last_error;
  }
};

export const measure = function(callback: () => void, skip_frame = false) {
  measure_callbacks.push(callback);
  if (!skip_frame) flush_on_next_frame();
};

export const mutate = function(callback: () => void, skip_frame = false) {
  mutate_callbacks.push(callback);
  if (!skip_frame) flush_on_next_frame();
};

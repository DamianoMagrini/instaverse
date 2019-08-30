/**
 * @module is-frame
 *
 * Returns true if the window is not the topmost in the stack.
 *
 * Dependencies: none
 */

const IS_FRAME = window !== window.top;
export default () => IS_FRAME;

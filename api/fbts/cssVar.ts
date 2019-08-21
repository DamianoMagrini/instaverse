/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule cssVar
 */

const CSS_VARS = {
  'fbui-desktop-background-light': '#f6f7f8',
  'fbui-desktop-text-placeholder': '#9197a3',
  'fbui-desktop-text-placeholder-focused': '#bdc1c9',
  'fbui-white': '#fff',
  'scrollbar-face-active-color': '#7d7d7d',
  'scrollbar-face-color': '#c2c2c2',
  'scrollbar-face-margin': '4px',
  'scrollbar-face-radius': '6px',
  'scrollbar-size': '15px',
  'scrollbar-size-large': '17px',
  'scrollbar-track-color': 'rgba(255, 255, 255, 0.8)'
};

import invariant from './invariant';

/**
 * @param {string} name
 */
function cssVar(name) {
  invariant(
    Object.prototype.hasOwnProperty.call(CSS_VARS, name),
    'Unknown key passed to cssVar: %s.',
    name
  );
  return CSS_VARS[name];
}

export default cssVar;

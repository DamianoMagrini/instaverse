/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule getStyleProperty
 * @typechecks
 */
import camelize from './camelize';

import hyphenate from './hyphenate';

const asString = (value: any): string =>
  value == null ? value : String(value);

/**
 * Gets the style property for the supplied node. This will return either the
 * computed style, if available, or the declared style.
 *
 * @param node
 * @param name Style property name.
 * @return Style property value.
 */
function getStyleProperty(node: HTMLElement, name: string): string | null {
  let computedStyle: CSSStyleDeclaration; // W3C Standard

  if (window.getComputedStyle) {
    // In certain cases such as within an iframe in FF3, this returns null.
    computedStyle = window.getComputedStyle(node, null);

    if (computedStyle) {
      return asString(computedStyle.getPropertyValue(hyphenate(name)));
    }
  }

  // Safari
  if (document.defaultView && document.defaultView.getComputedStyle) {
    computedStyle = document.defaultView.getComputedStyle(node, null); // A Safari bug causes this to return null for `display: none` elements.

    if (computedStyle) {
      return asString(computedStyle.getPropertyValue(hyphenate(name)));
    }

    if (name === 'display') {
      return 'none';
    }
  }

  return asString(node.style && node.style[camelize(name)]);
}

export default getStyleProperty;

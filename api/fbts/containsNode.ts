/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule containsNode
 * @flow
 */
import isTextNode from './isTextNode';

/*eslint-disable no-bitwise */

/**
 * Checks if a given DOM node contains or is another DOM node.
 */
function containsNode(outerNode: Node | null, innerNode: Node | null): boolean {
  if (!outerNode || !innerNode) {
    return false;
  } else if (outerNode === innerNode) {
    return true;
  } else if (isTextNode(outerNode)) {
    return false;
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode);
  } else if ('contains' in outerNode) {
    return outerNode.contains(innerNode);
    // @ts-ignore
  } else if (outerNode.compareDocumentPosition) {
    // @ts-ignore
    return Boolean(outerNode.compareDocumentPosition(innerNode) & 16);
  } else {
    return false;
  }
}

export default containsNode;

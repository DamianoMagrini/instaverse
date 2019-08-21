/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule createNodesFromMarkup
 * @typechecks
 */

/*eslint-disable fb-www/unsafe-html*/
import ExecutionEnvironment from './ExecutionEnvironment';

import createArrayFromMixed from './createArrayFromMixed';

import getMarkupWrap from './getMarkupWrap';

import invariant from './invariant';

/**
 * Dummy container used to render all markup.
 */
const dummyNode = ExecutionEnvironment.canUseDOM
  ? document.createElement('div')
  : null;

/**
 * Pattern used by `getNodeName`.
 */
const nodeNamePattern = /^\s*<(\w+)/;

/**
 * Extracts the `nodeName` of the first element in a string of markup.
 *
 * @param {string} markup String of markup.
 * @return {?string} Node name of the supplied markup.
 */
function getNodeName(markup) {
  const nodeNameMatch = markup.match(nodeNamePattern);
  return nodeNameMatch && nodeNameMatch[1].toLowerCase();
}

/**
 * Creates an array containing the nodes rendered from the supplied markup. The
 * optionally supplied `handleScript` function will be invoked once for each
 * <script> element that is rendered. If no `handleScript` function is supplied,
 * an exception is thrown if any <script> elements are rendered.
 */
function createNodesFromMarkup(
  markup: string,
  handleScript?: Function
): (HTMLElement | ChildNode)[] {
  let node: HTMLElement = dummyNode;
  invariant(Boolean(dummyNode), 'createNodesFromMarkup dummy not initialized');
  const nodeName = getNodeName(markup);
  const wrap = nodeName && getMarkupWrap(nodeName);

  if (wrap) {
    node.innerHTML = wrap[1] + markup + wrap[2];
    let wrapDepth = wrap[0];

    while (wrapDepth--) {
      // @ts-ignore
      node = node.lastChild;
    }
  } else {
    node.innerHTML = markup;
  }

  const scripts = node.getElementsByTagName('script');

  if (scripts.length) {
    invariant(
      handleScript,
      'createNodesFromMarkup(...): Unexpected <script> element rendered.'
    );
    createArrayFromMixed(scripts).forEach(handleScript);
  }

  const nodes = Array.from(node.childNodes);

  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }

  return nodes;
}

export default createNodesFromMarkup;

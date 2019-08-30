/// <reference path="index.d.ts" />

/**
 * @module dom-interface
 *
 * A module that gives some interfaces to the DOM: the React app root and the
 * document's scale
 *
 * Dependencies:
 *  - invariant-ex (9502825)
 */

import invariant_ex from './9502825_invariant-ex';

export const getRootElement = function() {
  const root_element = document.getElementById('react-root');
  invariant_ex(root_element);
  return root_element;
};

export const getDocumentScale = () => {
  const visual_viewport = window.visualViewport;
  return visual_viewport
    ? visual_viewport.scale
    : document.body
    ? document.body.clientWidth / window.innerWidth
    : 1;
};

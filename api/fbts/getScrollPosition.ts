import getDocumentScrollElement from './getDocumentScrollElement';

import getUnboundedScrollPosition from './getUnboundedScrollPosition';

/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are bounded. This means that if the scroll position is
 * negative or exceeds the element boundaries (which is possible using inertial
 * scrolling), you will get zero or the maximum scroll position, respectively.
 *
 * If you need the unbound scroll position, use `getUnboundedScrollPosition`.
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */
function getScrollPosition(scrollable) {
  const documentScrollElement = getDocumentScrollElement(
    scrollable.ownerDocument || scrollable.document
  );

  if (scrollable.Window && scrollable instanceof scrollable.Window) {
    scrollable = documentScrollElement;
  }

  const scrollPosition = getUnboundedScrollPosition(scrollable);
  const viewport =
    scrollable === documentScrollElement
      ? scrollable.ownerDocument.documentElement
      : scrollable;
  const xMax = scrollable.scrollWidth - viewport.clientWidth;
  const yMax = scrollable.scrollHeight - viewport.clientHeight;
  scrollPosition.x = Math.max(0, Math.min(scrollPosition.x, xMax));
  scrollPosition.y = Math.max(0, Math.min(scrollPosition.y, yMax));
  return scrollPosition;
}

export default getScrollPosition;

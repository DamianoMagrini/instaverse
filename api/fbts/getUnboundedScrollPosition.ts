/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */

function getUnboundedScrollPosition(scrollable) {
  if (scrollable.Window && scrollable instanceof scrollable.Window) {
    return {
      x:
        scrollable.pageXOffset ||
        scrollable.document.documentElement.scrollLeft,
      y: scrollable.pageYOffset || scrollable.document.documentElement.scrollTop
    };
  }

  return {
    x: scrollable.scrollLeft,
    y: scrollable.scrollTop
  };
}

export default getUnboundedScrollPosition;

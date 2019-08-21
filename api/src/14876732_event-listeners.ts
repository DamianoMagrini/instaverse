/**
 * @module event-listeners
 *
 * A function to add an event to an element, and one to remove it.
 *
 * Dependencies: none
 */

export const add = <TargetType extends Element | Document | Window>(
  element: TargetType,
  event: string,
  listener: (this: TargetType, event: Event) => boolean | void
): ((event: Event) => boolean | void) => {
  let listener_function: (event: Event) => void;

  if ('addEventListener' in element)
    element.addEventListener(
      event,
      (listener_function = (event: Event) => {
        if (listener.call(element, event) === false) {
          event.stopPropagation();
          event.preventDefault();
        }
      }),
      false
    );
  else if ('attachEvent' in element)
    // For IE <= 8 compatibility
    // @ts-ignore
    element.attachEvent(
      `on${event}`,
      (listener_function = (event: Event) =>
        listener.call(element, event || window.event))
    );

  return listener_function;
};

export const remove = (
  element: Element | Document | Window,
  event_name: string,
  listener_function: (this: Element, evevnt: Event) => any
) => {
  if ('removeEventListener' in element)
    element.removeEventListener(event_name, listener_function, false);
  else if ('detachEvent' in element)
    // For IE <= 8 compatibility
    // @ts-ignore
    element.detachEvent(`on${event_name}`, listener_function);
};

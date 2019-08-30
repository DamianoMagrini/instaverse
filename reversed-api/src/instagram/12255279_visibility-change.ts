/**
 * @module visibility-change
 *
 * An event emitter that fires when the document's visibility state changes.
 *
 * Dependencies:
 *  - mixinEventEmitter (former 14942211, now mixin-event-emitter)
 *  - ErrorUtils (former 9502822, now fbts/ErrorUtils)
 */

import mixinEventEmitter from '../mixin-event-emitter';
import ErrorUtils from '../fbts/ErrorUtils';

import EventEmitter from '../mixin-event-emitter/EventEmitter';

let hidden_event_name: string, visibility_change_event_name: string;

if ('hidden' in document) {
  hidden_event_name = 'hidden';
  visibility_change_event_name = 'visibilitychange';
} else if ('mozHidden' in document) {
  hidden_event_name = 'mozHidden';
  visibility_change_event_name = 'mozvisibilitychange';
} else if ('msHidden' in document) {
  hidden_event_name = 'msHidden';
  visibility_change_event_name = 'msvisibilitychange';
} else if ('webkitHidden' in document) {
  hidden_event_name = 'webkitHidden';
  visibility_change_event_name = 'webkitvisibilitychange';
}

const is_hidden = (): boolean =>
  hidden_event_name && document[hidden_event_name];

const is_supported = (): boolean =>
  document.addEventListener && visibility_change_event_name !== undefined;

const visibility_change = {
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  isHidden: is_hidden,
  isSupported: is_supported
};

mixinEventEmitter(visibility_change, { visible: true, hidden: true });

if (is_supported())
  document.addEventListener(
    visibility_change_event_name,
    ErrorUtils.guard(function() {
      ((<unknown>visibility_change) as EventEmitter).emit(
        is_hidden() ? visibility_change.HIDDEN : visibility_change.VISIBLE
      );
    }, 'visibility change')
  );

export default (<unknown>visibility_change) as EventEmitter;

import EventEmitter from './EventEmitter';
import EventEmitterWithHolding from './EventEmitterWithHolding';
import EventHolder from './EventHolder';
import EventValidator from './EventValidator';

import copyProperties from './copyProperties';
import invariant from '../fbts/invariant';
import keyOf from '../fbts/keyOf';

const TYPES_KEY = keyOf({ __types: true });

function mixInEventEmitter(cls, types): void {
  invariant(types, 'Must supply set of valid event types');

  const target = cls.prototype || cls;

  invariant(!target.__eventEmitter, 'An active emitter is already mixed in');

  const constructor = cls.constructor;
  if (constructor) {
    invariant(
      constructor === Object || constructor === Function,
      'Mix EventEmitter into a class, not an instance'
    );
  }

  if (target.hasOwnProperty(TYPES_KEY)) {
    copyProperties(target.__types, types);
  } else if (target.__types) {
    target.__types = copyProperties({}, target.__types, types);
  } else {
    target.__types = types;
  }
  copyProperties(target, EventEmitterMixin);
}

const EventEmitterMixin = {
  emit(eventType, a, b, c, d, e, _) {
    return this.__getEventEmitter().emit(eventType, a, b, c, d, e, _);
  },

  emitAndHold(eventType, a, b, c, d, e, _) {
    return this.__getEventEmitter().emitAndHold(eventType, a, b, c, d, e, _);
  },

  addListener(eventType, listener, context) {
    return this.__getEventEmitter().addListener(eventType, listener, context);
  },

  once(eventType, listener, context) {
    return this.__getEventEmitter().once(eventType, listener, context);
  },

  addRetroactiveListener(eventType, listener, context) {
    return this.__getEventEmitter().addRetroactiveListener(
      eventType,
      listener,
      context
    );
  },

  addListenerMap(listenerMap, context) {
    return this.__getEventEmitter().addListenerMap(listenerMap, context);
  },

  addRetroactiveListenerMap(listenerMap, context) {
    return this.__getEventEmitter().addListenerMap(listenerMap, context);
  },

  removeAllListeners() {
    this.__getEventEmitter().removeAllListeners();
  },

  removeCurrentListener() {
    this.__getEventEmitter().removeCurrentListener();
  },

  releaseHeldEventType(eventType) {
    this.__getEventEmitter().releaseHeldEventType(eventType);
  },

  __getEventEmitter: function __getEventEmitter() {
    if (!this.__eventEmitter) {
      let emitter = new EventEmitter();
      emitter = EventValidator.addValidation(emitter, this.__types);

      const holder = new EventHolder();
      this.__eventEmitter = new EventEmitterWithHolding(emitter, holder);
    }
    return this.__eventEmitter;
  }
};

export default mixInEventEmitter;

import EventEmitter from './EventEmitter';
import EventHolder from './EventHolder';

class EventEmitterWithHolding {
  _emitter: EventEmitter;
  _eventHolder: EventHolder;
  _currentEventToken;
  _emittingHeldEvents: boolean;

  constructor(emitter: EventEmitter, holder: EventHolder) {
    this._emitter = emitter;
    this._eventHolder = holder;
    this._currentEventToken = null;
    this._emittingHeldEvents = false;
  }

  addListener(eventType, listener, context) {
    return this._emitter.addListener(eventType, listener, context);
  }

  once(eventType, listener, context) {
    return this._emitter.once(eventType, listener, context);
  }

  addRetroactiveListener(eventType, listener, context) {
    const subscription = this._emitter.addListener(
      eventType,
      listener,
      context
    );

    this._emittingHeldEvents = true;
    this._eventHolder.emitToListener(eventType, listener, context);
    this._emittingHeldEvents = false;

    return subscription;
  }

  removeAllListeners(eventType) {
    this._emitter.removeAllListeners(eventType);
  }

  removeCurrentListener() {
    this._emitter.removeCurrentListener();
  }

  listeners(eventType) {
    return this._emitter.listeners(eventType);
  }

  emit(eventType, ...args) {
    const _emitter = this._emitter;
    _emitter.emit.apply(_emitter, [eventType, ...args]);
  }

  emitAndHold(eventType, ...args) {
    const _eventHolder = (this._currentEventToken = this._eventHolder);
    this._currentEventToken.holdEvent.apply(_eventHolder, [eventType, ...args]);

    const _emitter2 = this._emitter;
    _emitter2.emit.apply(_emitter2, [eventType, ...args]);

    this._currentEventToken = null;
  }

  releaseCurrentEvent() {
    if (this._currentEventToken) {
      this._eventHolder.releaseEvent(this._currentEventToken);
    } else if (this._emittingHeldEvents) {
      this._eventHolder.releaseCurrentEvent();
    }
  }

  releaseHeldEventType(eventType) {
    this._eventHolder.releaseEventType(eventType);
  }
}

export default EventEmitterWithHolding;

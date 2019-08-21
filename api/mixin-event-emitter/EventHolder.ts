import invariant from '@fbts/invariant';

class EventHolder {
  _heldEvents: { [key: string]: any };
  _currentEventKey;

  constructor() {
    this._heldEvents = {};
    this._currentEventKey = null;
  }

  holdEvent(eventType) {
    this._heldEvents[eventType] = this._heldEvents[eventType] || [];
    const eventsOfType = this._heldEvents[eventType];
    const key = {
      eventType: eventType,
      index: eventsOfType.length
    };

    const _len = arguments.length,
      args = Array(_len > 1 ? _len - 1 : 0);

    for (let _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    eventsOfType.push(args);
    return key;
  }

  emitToListener(eventType, listener, context) {
    const self = this;
    const eventsOfType = this._heldEvents[eventType];
    if (!eventsOfType) {
      return;
    }
    const origEventKey = this._currentEventKey;
    eventsOfType.forEach(function(eventHeld, index) {
      if (!eventHeld) {
        return;
      }
      self._currentEventKey = {
        eventType: eventType,
        index: index
      };

      listener.apply(context, eventHeld);
    });
    this._currentEventKey = origEventKey;
  }

  releaseCurrentEvent() {
    invariant(
      this._currentEventKey !== null,
      'Not in an emitting cycle; there is no current event'
    );

    this._currentEventKey && this.releaseEvent(this._currentEventKey);
  }

  releaseEvent(token) {
    delete this._heldEvents[token.eventType][token.index];
  }

  releaseEventType(type) {
    this._heldEvents[type] = [];
  }
}

export default EventHolder;

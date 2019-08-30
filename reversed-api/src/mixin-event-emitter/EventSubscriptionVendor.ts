import invariant from '../fbts/invariant';

class EventSubscriptionVendor {
  _subscriptionsForType: { [key: string]: any };
  _currentSubscription;

  constructor() {
    this._subscriptionsForType = {};
    this._currentSubscription = null;
  }

  addSubscription(eventType: string, subscription) {
    invariant(
      subscription.subscriber === this,
      'The subscriber of the subscription is incorrectly set.'
    );
    if (!this._subscriptionsForType[eventType]) {
      this._subscriptionsForType[eventType] = [];
    }
    const key = this._subscriptionsForType[eventType].length;
    this._subscriptionsForType[eventType].push(subscription);
    subscription.eventType = eventType;
    subscription.key = key;
    return subscription;
  }

  removeAllSubscriptions(eventType) {
    if (eventType === undefined) {
      this._subscriptionsForType = {};
    } else {
      delete this._subscriptionsForType[eventType];
    }
  }

  removeSubscription(subscription) {
    const eventType = subscription.eventType;
    const key = subscription.key;

    const subscriptionsForType = this._subscriptionsForType[eventType];
    if (subscriptionsForType) {
      delete subscriptionsForType[key];
    }
  }

  getSubscriptionsForType(eventType) {
    return this._subscriptionsForType[eventType];
  }
}

export default EventSubscriptionVendor;

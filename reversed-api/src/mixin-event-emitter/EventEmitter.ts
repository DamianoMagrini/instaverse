import EmitterSubscription from './EmitterSubscription';
import EventSubscriptionVendor from './EventSubscriptionVendor';

import emptyFunction from '../fbts/emptyFunction';
import invariant from '../fbts/invariant';

class EventEmitter {
  _subscriber: EventSubscriptionVendor;
  _currentSubscription;

  constructor(subscriber?: EventSubscriptionVendor) {
    this._subscriber = subscriber || new EventSubscriptionVendor();
  }

  addListener(eventType: string, listener: Function, context?: any) {
    return this._subscriber.addSubscription(
      eventType,
      new EmitterSubscription(this, this._subscriber, listener, context)
    );
  }

  once(eventType: string, listener: Function, context: any) {
    const self = this;
    return this.addListener(eventType, function() {
      const args = [...arguments];
      self.removeCurrentListener();
      listener.apply(context, args);
    });
  }

  removeAllListeners(eventType: string) {
    this._subscriber.removeAllSubscriptions(eventType);
  }

  removeCurrentListener() {
    invariant(
      this._currentSubscription,
      'Not in an emitting cycle; there is no current subscription'
    );

    this.removeSubscription(this._currentSubscription);
  }

  removeSubscription(subscription) {
    invariant(
      subscription.emitter === this,
      'Subscription does not belong to this emitter.'
    );

    this._subscriber.removeSubscription(subscription);
  }

  listeners(eventType: string) {
    const subscriptions = this._subscriber.getSubscriptionsForType(eventType);
    return subscriptions
      ? subscriptions
          .filter(emptyFunction.thatReturnsTrue)
          .map(function(subscription) {
            return subscription.listener;
          })
      : [];
  }

  emit(eventType: string, ...args) {
    const subscriptions = this._subscriber.getSubscriptionsForType(eventType);
    if (subscriptions) {
      for (let i = 0, l = subscriptions.length; i < l; i++) {
        const subscription = subscriptions[i];

        if (subscription) {
          this._currentSubscription = subscription;
          subscription.listener.apply(subscription.context, args);
        }
      }
      this._currentSubscription = null;
    }
  }

  removeListener(eventType: string, listener: Function) {
    const subscriptions = this._subscriber.getSubscriptionsForType(eventType);
    if (subscriptions) {
      for (let i = 0, l = subscriptions.length; i < l; i++) {
        const subscription = subscriptions[i];

        if (subscription && subscription.listener === listener) {
          subscription.remove();
        }
      }
    }
  }
}

export default EventEmitter;

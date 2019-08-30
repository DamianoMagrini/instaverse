import EventSubscriptionVendor from './EventSubscriptionVendor';

class EventSubscription {
  subscriber: EventSubscriptionVendor;

  constructor(subscriber: EventSubscriptionVendor) {
    this.subscriber = subscriber;
  }

  remove() {
    this.subscriber.removeSubscription(this);
  }
}

export default EventSubscription;

import EventSubscription from './EventSubscription';
import EventSubscriptionVendor from './EventSubscriptionVendor';

class EmitterSubscription extends EventSubscription {
  emitter;
  listener: Function;
  context;

  constructor(
    emitter,
    subscriber: EventSubscriptionVendor,
    listener: Function,
    context
  ) {
    super(subscriber);
    this.emitter = emitter;
    this.listener = listener;
    this.context = context;
    return this;
  }

  remove() {
    this.emitter.removeSubscription(this);
  }
}

export default EmitterSubscription;

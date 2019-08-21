/**
 * @module event-loop
 *
 * An internal emulated event loop.
 *
 * Dependencies:
 *  - react-measure (9568288)
 */

import * as react_measure from './9568288_react-measure';

class Subscription {
  canceled = false;

  $EventLoopSubscription1: () => void;
  nativeId: number;

  constructor(subscription: () => void, native_id: number) {
    this.$EventLoopSubscription1 = subscription;
    this.nativeId = native_id;
  }

  runOnFlush = () => {
    react_measure.mutate(() => {
      this.canceled || this.$EventLoopSubscription1();
    });
  };
}

class EventLoop {
  counter = 0;
  subscriptions = new Map<number, Subscription>();

  setTimeout = (handler: () => void, delay: number) =>
    this.$EventLoop1(window.setTimeout, handler, delay);

  setInterval = (handler: () => void, interval: number) =>
    this.$EventLoop1(window.setInterval, handler, interval);

  $EventLoop1 = (
    caller_function: (handler: Function, timeout: number) => number,
    handler: () => void,
    timeout: number
  ) => {
    const native_id = caller_function(() => subscription.runOnFlush(), timeout);
    const subscription = new Subscription(handler, native_id);
    const id = this.counter++;
    this.subscriptions.set(id, subscription);
    return id;
  };

  clearTimeout = (id: number) => {
    if (id !== null) {
      const subscription = this.subscriptions.get(id);
      if (subscription !== null) {
        subscription.canceled = true;
        window.clearTimeout(subscription.nativeId);
      }
      this.subscriptions.delete(id);
    }
  };

  clearInterval = this.clearTimeout;

  wait = (delay: number) => {
    return new Promise((resolve) => {
      this.setTimeout(resolve, delay);
    });
  };
}

export default new EventLoop();

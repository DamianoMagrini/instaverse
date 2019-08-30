/**
 * @module payload-storage
 *
 * Utilities to stack payloads and unload them one-by-one on a callback.
 *
 * Dependencies: none
 */

const payloads: {
  [name: string]: {
    route: string;
    payload: any;
  };
} = {};

const payload_storage = {
  addPayload(name: string, value: any) {
    payloads[name] = value;
  },

  removePayload(name: string) {
    delete payloads[name];
  },

  unload(callback: (route: string, payload: any) => void) {
    for (let name in payloads) {
      const payload = payloads[name];
      callback(payload.route, payload.payload);
    }
  }
};

export default payload_storage;

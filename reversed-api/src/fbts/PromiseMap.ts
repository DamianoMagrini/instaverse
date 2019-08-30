import Deferred from './Deferred';
import invariant from './invariant';

/**
 * A map of asynchronous values that can be get or set in any order. Unlike a
 * normal map, setting the value for a particular key more than once throws.
 * Also unlike a normal map, a key can either be resolved or rejected.
 */
class PromiseMap<Tvalue, Treason> {
  _deferred: {
    [key: string]: Deferred<any, any>;
  };

  constructor() {
    this._deferred = {};
  }

  get(key: string): Promise<any> {
    return getDeferred(this._deferred, key).getPromise();
  }

  resolveKey(key: string, value: Tvalue): void {
    const entry = getDeferred(this._deferred, key);
    invariant(!entry.isSettled(), 'PromiseMap: Already settled `%s`.', key);
    entry.resolve(value);
  }

  rejectKey(key: string, reason: Treason): void {
    const entry = getDeferred(this._deferred, key);
    invariant(!entry.isSettled(), 'PromiseMap: Already settled `%s`.', key);
    entry.reject(reason);
  }
}

function getDeferred(
  entries: {
    [key: string]: Deferred<any, any>;
  },
  key: string
): Deferred<any, any> {
  if (!entries.hasOwnProperty(key)) {
    entries[key] = new Deferred();
  }

  return entries[key];
}

export default PromiseMap;

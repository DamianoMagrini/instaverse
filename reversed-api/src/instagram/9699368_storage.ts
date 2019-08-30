/**
 * @module storage
 *
 * Provides read/write access to the browser's storage.
 *
 * Dependencies:
 *  - ex (9502826)
 *  - ErrorUtils (former 14942209, now fbts/ErrorUtils)
 */

import ex from './9502826_ex';
import ErrorUtils from '../fbts/ErrorUtils';

let cached_properties = {};

function get_property(property: string): any {
  if (!cached_properties.hasOwnProperty(property))
    cached_properties[property] = get_storage(property);
  return cached_properties[property];
}

function is_storage(name: string): boolean {
  try {
    const window_property: any = window[name];
    if (window_property) {
      const test_item_name = '__test__' + Date.now();
      window_property.setItem(test_item_name, '');
      window_property.removeItem(test_item_name);
    }
    return true;
  } catch {
    return false;
  }
}

function get_storage(name: string): any | void {
  if (is_storage(name)) return window[name];
}

function get_storage_keys(storage_object: Storage): string[] {
  const keys = [];
  for (let key_index = 0; key_index < storage_object.length; key_index++)
    keys.push(storage_object.key(key_index));
  return keys;
}

export const getLocalStorage = (): Storage => get_property('localStorage');
export const getSessionStorage = (): Storage => get_property('sessionStorage');
export const isLocalStorageSupported = () => is_storage('localStorage');
export const isSessionStorageSupported = () => is_storage('sessionStorage');
export const setItemGuarded = (
  storage_object: Storage,
  key: string,
  value: any
) => {
  let error = null;

  try {
    storage_object.setItem(key, value);
  } catch {
    const storage_keys = get_storage_keys(storage_object).map(
      (key) => key + '(' + storage_object.getItem(key).length + ')'
    );

    error = new Error(
      ex(
        'Storage quota exceeded while setting %s(%s). Items(length) follows: %s',
        key,
        value.length,
        storage_keys.join()
      )
    );
    ErrorUtils.reportError(error);
  }

  return error;
};

/**
 * @module page
 *
 * Provides a class for creating... something.
 *
 * Dependencies:
 *  - random-6-char-string (9830466)
 *  - storage (9699368)
 *  - stringify (9699366)
 */

import random_6_char_string from './9830466_random-6-char-string';
import * as storage from './9699368_storage';
import timeout from './9699366_timeout';

let local_storage_set = false;
let local_storage = null;
let page_id = random_6_char_string;

function get_local_storage() {
  if (!local_storage_set) {
    local_storage_set = true;
    local_storage = storage.getLocalStorage();
  }
  return local_storage;
}

export default class Page {
  static testSetPageID(new_id: string) {
    page_id = new_id;
  }

  name: string;
  $WebStorageMutex3: number;

  constructor(name: string) {
    this.name = name;
  }

  $WebStorageMutex1() {
    if (!get_local_storage()) return page_id;
    let mutex_item = get_local_storage().getItem('mutex_' + this.name);
    mutex_item = mutex_item ? mutex_item.split(':') : null;
    return mutex_item && mutex_item[1] >= Date.now() ? mutex_item[0] : null;
  }

  $WebStorageMutex2(length: number) {
    if (get_local_storage()) {
      const expiry = Date.now() + (length || 10000);
      storage.setItemGuarded(
        get_local_storage(),
        'mutex_' + this.name,
        page_id + ':' + expiry
      );
    }
  }

  hasLock() {
    return this.$WebStorageMutex1() === page_id;
  }

  lock(
    if_locked: (page: Page) => void,
    if_not_locked?: (page: Page) => void,
    length?: number
  ) {
    this.$WebStorageMutex3 && clearTimeout(this.$WebStorageMutex3);
    if (page_id == (this.$WebStorageMutex1() || page_id)) {
      this.$WebStorageMutex2(length);

      this.$WebStorageMutex3 = timeout(() => {
        this.$WebStorageMutex3 = null;
        const callback = this.hasLock() ? if_locked : if_not_locked;
        if (callback) callback(this);
      }, 0);
    }
  }

  unlock() {
    this.$WebStorageMutex3 && clearTimeout(this.$WebStorageMutex3);
    if (get_local_storage() && this.hasLock())
      get_local_storage().removeItem('mutex_' + this.name);
  }
}

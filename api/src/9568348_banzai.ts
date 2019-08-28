/**
 * @module banzai
 *
 * Module for logging and sending events.
 *
 * Dependencies:
 *  - is-frame (14876727)
 *  - banzai-shared (14876728)
 *  - random-6-char-string (9830466)
 *  - config (9568270)
 *  - ErrorUtils (former, 9502822, now @fbts/ErrorUtils)
 *  - event-logging (14876729)
 *  - banzai-actions-constants (9568349)
 *  - mid (9699338)
 *  - storage (9699368)
 *  - page (14876730)
 *  - log-error (9568324)
 *  - environment-metadata (9502827)
 *  - payload-storage (14876731)
 */

import is_frame from './14876727_is-frame';
import * as banzai_shared from './14876728_banzai-shared';
import random_6_char_string from './9830466_random-6-char-string';
import * as config from './9568270_config';
import ErrorUtils from '@fbts/ErrorUtils';
import * as event_logging from './14876729_event-logging';
import * as BANZAI_ACTIONS_CONSTANTS from './9568349_banzai-actions-constants';
import * as mid from './9699338_mid';
import * as storage from './9699368_storage';
import Page from './14876730_page';
import log_error from './9568324_log-error';
import environment_metadata from './9502827_environment-metadata';
import payload_storage from './14876731_payload-storage';

import { ExtendedEvent } from './9568347_events';

interface EventMetadata {
  status: number;
  retry?: boolean;
  pageID?: string;
  userID?: string;
  callback?: Function;
}

export type BanzaiEvent = [string, ExtendedEvent, number, number] & {
  __meta?: EventMetadata;
};

interface WrappedEvent {
  user: string;
  page_id: string;
  app_id: string;
  device_id: string;
  posts: BanzaiEvent[];
  trigger?: string;
  send_method?: string;
}

export interface PostOptions {
  retry?: any;
  callback?: any;
  delay?: any;
  signal?: any;
}

const IS_FRAME = is_frame();

const BANZAI_SCHEME = 'bz:';
const BANZAI_ODS_SCHEME = 'ods:banzai';
const BEACON_SEND_FAILURE_EVENT_NAME = 'send_via_beacon_failure';

const STATUS_A = 0;
const STATUS_B = 1;
const STATUS_C = 2;

let local_storage: Storage;
let local_storage_loaded = false;
let banzai_storage_buffer: BanzaiEvent[] = [];
let banzai_storage: { store: () => void; restore: () => void };

let last_cached_timeout: number;
let last_cached_expiry: number;
let last_cached_route: string = null;

const A = ErrorUtils.guard(
  () => {
    wrap_and_send_all(null, null);
  },
  'Banzai.send',
  { isContinuation: false }
);

const has_not_expired = (event: BanzaiEvent) => {
  return event[2] >= Date.now() - banzai_shared.EXPIRY;
};

const register_event = (event: BanzaiEvent, status_code: number) => {
  event.__meta.status = STATUS_A;
  event[3] = (event[3] || 0) + 1;
  if (!event.__meta.retry && status_code >= 400 && status_code < 600)
    banzai_storage_buffer.push(event);
};

const create_event = (
  name: string,
  event: ExtendedEvent,
  lifetime: number,
  retry?: boolean
) => {
  const banzai_event: BanzaiEvent = [name, event, lifetime, 0];
  banzai_event.__meta = {
    retry: retry === true,
    pageID: random_6_char_string,
    userID: config.getViewerId(),
    status: STATUS_A
  };
  return banzai_event;
};

const schedule = (delay: number) => {
  const expiry = Date.now() + delay;
  if (!last_cached_expiry || expiry < last_cached_expiry) {
    last_cached_expiry = expiry;
    clearTimeout(last_cached_timeout);
    last_cached_timeout = (<unknown>setTimeout(A, delay)) as number;
    return true;
  }
};

const wrap_and_send_all = (
  if_no_buffered_events?: () => void,
  on_ready?: () => void
) => {
  last_cached_expiry = null;
  schedule(banzai_shared.BASIC_WAIT);

  if (!event_logging.readyToSend()) {
    if (on_ready) on_ready();
    return;
  }

  event_logging.inform(BANZAI_ACTIONS_CONSTANTS.SEND);

  const wrapped_events_array: WrappedEvent[] = [];
  const events_array: BanzaiEvent[] = [];
  banzai_storage_buffer = get_updated_storage_buffer(
    wrapped_events_array,
    events_array,
    true,
    banzai_storage_buffer
  );

  if (wrapped_events_array.length === 0) {
    event_logging.inform(BANZAI_ACTIONS_CONSTANTS.OK);
    if (if_no_buffered_events) if_no_buffered_events();
    return;
  }

  wrapped_events_array[0].trigger = last_cached_route;
  last_cached_route = null;
  wrapped_events_array[0].send_method = 'ajax';

  event_logging.send(
    wrapped_events_array,
    () => {
      events_array.forEach((t) => {
        t.__meta.status = STATUS_C;
        if (t.__meta.callback) t.__meta.callback();
      });
      if (if_no_buffered_events) if_no_buffered_events();
    },
    (status_code) => {
      events_array.forEach((event) => {
        register_event(event, status_code);
      });
      if (on_ready) on_ready();
    }
  );
};

const initialize_storage_buffer = () => {
  if (!canUseNavigatorBeacon()) return;

  const wrapped_events_array: WrappedEvent[] = [];
  const events_array: BanzaiEvent[] = [];
  banzai_storage_buffer = get_updated_storage_buffer(
    wrapped_events_array,
    events_array,
    false,
    banzai_storage_buffer
  );

  if (wrapped_events_array.length === 0) return;
  if (!event_logging.sendWithBeacon(wrapped_events_array)) {
    events_array.forEach((event) => {
      banzai_storage_buffer.push(event);
    });
    banzai_storage_buffer.push(
      create_event(
        BANZAI_ODS_SCHEME,
        { [BEACON_SEND_FAILURE_EVENT_NAME]: [1] },
        Date.now()
      )
    );
  }
};

const get_updated_storage_buffer = (
  wrapped_events_array: WrappedEvent[],
  events_array: BanzaiEvent[],
  should_retry: boolean,
  current_storage_buffer: BanzaiEvent[]
) => {
  const wrapped_events: {
    [id: string]: WrappedEvent;
  } = {};

  return current_storage_buffer.filter((event) => {
    const metadata = event.__meta;
    if (metadata.status >= STATUS_C || !has_not_expired(event)) return false;
    if (metadata.status >= STATUS_B) return true;
    const event_id = metadata.pageID + metadata.userID;
    let wrapped_event = wrapped_events[event_id];
    if (!wrapped_event) {
      wrapped_event = {
        user: metadata.userID,
        page_id: metadata.pageID,
        app_id: config.getIGAppID(),
        device_id: mid.getMID(),
        posts: []
      };
      wrapped_events[event_id] = wrapped_event;
      wrapped_events_array.push(wrapped_event);
    }
    metadata.status = STATUS_B;
    wrapped_event.posts.push(event);
    events_array.push(event);
    return should_retry && metadata.retry;
  });
};

const get_local_storage = () => {
  if (!local_storage_loaded) {
    local_storage_loaded = true;
    local_storage = storage.getLocalStorage();
  }
  return local_storage;
};

const init_methods = () => {
  if (!banzai_storage)
    if (IS_FRAME) banzai_storage = { store() {}, restore() {} };
    else
      banzai_storage = {
        store(): void {
          const local_storage = get_local_storage();
          if (!local_storage || banzai_storage_buffer.length === 0) return;
          const normalized_events: [
            string,
            ExtendedEvent | any,
            number,
            number,
            EventMetadata
          ][] = banzai_storage_buffer.map((item) => [
            item[0],
            item[1],
            item[2],
            item[3] || 0,
            item.__meta
          ]);
          banzai_storage_buffer = [];
          local_storage.setItem(
            BANZAI_SCHEME + random_6_char_string + '.' + Date.now(),
            JSON.stringify(normalized_events)
          );
        },
        restore(): void {
          const local_storage = get_local_storage();
          if (local_storage)
            new Page('banzai').lock((page) => {
              const banzai_storage_entries = [];
              for (let index = 0; index < local_storage.length; index++) {
                const event_name = local_storage.key(index);
                if (
                  event_name.indexOf(BANZAI_SCHEME) === 0 &&
                  event_name.indexOf('bz:__') !== 0
                )
                  banzai_storage_entries.push(event_name);
              }
              banzai_storage_entries.forEach((entry) => {
                const item = local_storage.getItem(entry);
                local_storage.removeItem(entry);
                if (!item) return;
                JSON.parse(item /* , module.id */).forEach(
                  (
                    event_array: [
                      string,
                      ExtendedEvent,
                      number,
                      number,
                      EventMetadata
                    ]
                  ) => {
                    if (!event_array) return;
                    const event: BanzaiEvent = [
                      event_array[0],
                      event_array[1],
                      event_array[2],
                      event_array[3]
                    ];
                    event.__meta = event_array[4];
                    if (has_not_expired(event)) {
                      event.__meta.status = STATUS_A;
                      banzai_storage_buffer.push(event);
                    }
                  }
                );
              });
              page.unlock();
            });
        }
      };
};

const initialize_logging = () => {
  event_logging.inform(BANZAI_ACTIONS_CONSTANTS.STORE);
  init_methods();
  banzai_storage.store();
};

const on_visible = () => {
  init_methods();
  banzai_storage.restore();
  event_logging.inform(BANZAI_ACTIONS_CONSTANTS.RESTORE);
  schedule(banzai_shared.RESTORE_WAIT);
};

const unload = () => {
  payload_storage.unload(post);
  event_logging.cleanup();
  event_logging.inform(BANZAI_ACTIONS_CONSTANTS.SHUTDOWN);
  banzai_storage_buffer.length > 0 && initialize_storage_buffer();
  event_logging.inform(BANZAI_ACTIONS_CONSTANTS.STORE);
  init_methods();
  banzai_storage.store();
};

export const isEnabled = (name: string) => {
  return banzai_shared.gks && banzai_shared.gks[name];
};

export const post = (route: string, data: any, options?: PostOptions) => {
  if (!route) log_error('Banzai.post called without specifying a route');
  options = options || {};
  const should_retry = options.retry;

  if (banzai_shared.disabled) return;
  if (!environment_metadata.canUseDOM) return;
  if (banzai_shared.blacklist.has(route)) return;

  const event = create_event(route, data, Date.now(), should_retry);
  if (options.callback) event.__meta.callback = options.callback;
  let event_delay = options.delay;
  if (event_delay === null) event_delay = banzai_shared.BASIC_WAIT;
  if (options.signal) {
    event.__meta.status = STATUS_B;
    event_logging.send(
      [
        {
          device_id: mid.getMID(),
          app_id: config.getIGAppID(),
          user: config.getViewerId(),
          page_id: random_6_char_string,
          posts: [event],
          trigger: route
        }
      ],
      () => {
        event.__meta.status = STATUS_C;
        if (event.__meta.callback) event.__meta.callback();
      },
      (status_code) => {
        register_event(event, status_code);
      },
      true
    );
    if (!should_retry) return;
  }
  banzai_storage_buffer.push(event);
  if (schedule(event_delay) || !last_cached_route) last_cached_route = route;
};

export const flush = (
  if_no_buffered_events: () => void,
  on_ready: () => void
) => {
  clearTimeout(last_cached_timeout);
  last_cached_timeout = 0;
  wrap_and_send_all(if_no_buffered_events, on_ready);
};

export const subscribe = event_logging.subscribe;

export const canUseNavigatorBeacon = () => navigator && navigator.sendBeacon;

export const _schedule = schedule;

export const _initialize = () => {
  if (environment_metadata.canUseDOM) {
    event_logging.setHooks((event) => {
      initialize_storage_buffer();
      initialize_logging();
    }, on_visible);
    event_logging.setUnloadHook(unload);
  }
};

_initialize();

export const _clearBuffer = () => {
  banzai_storage_buffer = [];
};

export const _clearStorage = () => {
  banzai_storage = undefined;
  local_storage = undefined;
  local_storage_loaded = false;
};

/// <reference path="index.d.ts" />

/**
 * @module events
 *
 * Functions for managing events.
 *
 * Dependencies:
 *  - storage (9699368)
 *  - config (9568270)
 *  - mid (9699338)
 *  - http (9568364)
 *  - event-logging-endpoint (14876718)
 *  - log-error (9568324)
 *  - query-serializer (14680200)
 */

import * as storage from './9699368_storage';
import * as config from './9568270_config';
import * as mid from './9699338_mid';
import * as http from './9568364_http';
import EVENT_LOGGING_ENDPOINT from './14876718_event-logging-endpoint';
import log_error from './9568324_log-error';
import query_serializer from './14680200_query-serializer';

const STATE_STORAGE_ITEM = 'pigeon_state';
const LOG_TYPE = 'client_event';
const EVENT_DELAY_MS = 180000;
const DEVICE_INFO_DELAY_MS = 43200000;

let state: State = null;
let on_request_failed_callback: OnRequestFailedCallback = null;

interface State {
  local: { lastDeviceInfoTime: number };
  session: { sequenceID: number; lastEventTime: number; sessionID: string };
}

export interface ExtendedEvent {
  time: number;
  description: string;
  extra: any;
  [key: string]: any;
}

type OnRequestFailedCallback = ({ event_count: number }) => void;

function generate_initial_state(): State {
  const initial_state: State = {
    local: { lastDeviceInfoTime: 0 },
    session: { sequenceID: 0, lastEventTime: 0, sessionID: '' }
  };

  const local_storage = storage.getLocalStorage();
  if (local_storage)
    try {
      const local_storage_state = local_storage.getItem(STATE_STORAGE_ITEM);
      if (local_storage_state)
        initial_state.local = JSON.parse(local_storage_state);
    } catch {}

  const session_storage = storage.getSessionStorage();
  if (session_storage)
    try {
      const session_storage_state = session_storage.getItem(STATE_STORAGE_ITEM);
      if (session_storage_state)
        initial_state.session = JSON.parse(session_storage_state);
    } catch {}

  return initial_state;
}

function getState(): State {
  if (!state) state = generate_initial_state();
  const current_time = Date.now();
  if (current_time - EVENT_DELAY_MS > state.session.lastEventTime) {
    state.session.sessionID =
      current_time.toString(16) +
      '-' +
      (~~(Math.random() * 16777215)).toString(16);
    state.session.sequenceID = 0;
  }
  return state;
}

const get_device_info = () => ({
  user_agent: window.navigator.userAgent,
  screen_height: window.screen.availHeight,
  screen_width: window.screen.availWidth,
  density: window.screen.devicePixelRatio || null,
  platform: window.navigator.platform || null,
  locale: window.navigator.language || null
});

const get_device_status = () => ({ locale: window.navigator.language });

function createEvent(
  description: string,
  extra: any,
  other?: any
): ExtendedEvent {
  const current_state = getState();
  current_state.session.lastEventTime = Date.now();
  return {
    time: current_state.session.lastEventTime / 1000,
    description,
    extra,
    ...other
  };
}

const get_device_data_events = (): ExtendedEvent[] => {
  const current_state = getState();
  const events: ExtendedEvent[] = [];

  if (current_state.session.sequenceID === 0)
    events.push(createEvent('device_status', get_device_status()));

  const current_time = Date.now();
  if (
    current_time - current_state.local.lastDeviceInfoTime >
    DEVICE_INFO_DELAY_MS
  ) {
    events.push(createEvent('device_id', get_device_info()));
    current_state.local.lastDeviceInfoTime = current_time;
  }

  return events;
};

function packageEvents(
  events: ExtendedEvent[]
): { access_token: string; message: string } {
  const current_state = getState();

  return {
    access_token: config.getGraphTokenForApp(),
    message: JSON.stringify({
      app_uid: config.getViewerId(),
      app_id: config.getIGAppID(),
      app_ver: config.getAppVersion(),
      data: events,
      log_type: LOG_TYPE,
      seq: current_state.session.sequenceID++,
      session_id: current_state.session.sessionID,
      device_id: mid.getMID()
    })
  };
}

export { getState, createEvent, packageEvents };

export const _clearState = function(): void {
  state = null;
};

export const store = function(): void {
  if (state) {
    const local_storage = storage.getLocalStorage();
    if (local_storage)
      try {
        local_storage.setItem(STATE_STORAGE_ITEM, JSON.stringify(state.local));
      } catch {}

    const session_storage = storage.getSessionStorage();
    if (session_storage)
      try {
        session_storage.setItem(
          STATE_STORAGE_ITEM,
          JSON.stringify(state.session)
        );
      } catch {}
  }
};

export const onRequestFailed = (callback: OnRequestFailedCallback): void => {
  on_request_failed_callback = callback;
};

export const send = async function(
  events: ExtendedEvent[],
  request_options: {
    timeout: number;
    referenceToXhr: (xhr: XMLHttpRequest) => void;
  }
): Promise<Response | void> {
  if (config.needsToConfirmCookies()) return Promise.resolve();
  const current_state = getState();

  events = [...events, ...get_device_data_events()];

  try {
    return http.post(
      EVENT_LOGGING_ENDPOINT,
      packageEvents(events),
      {
        contentType: 'application/x-www-form-urlencoded',
        omitAjaxHeader: true,
        omitAppIDHeader: true,
        omitLanguageParam: true,
        timeout: request_options.timeout || 0
      },
      request_options.referenceToXhr ? null : () => {}
    );
  } catch (error) {
    current_state.session = {
      sequenceID: 0,
      lastEventTime: 0,
      sessionID: ''
    };

    if (
      error instanceof http.AjaxError &&
      error.statusCode === 0 &&
      on_request_failed_callback
    )
      on_request_failed_callback({ event_count: events.length });

    log_error(error);
    return Promise.reject(error);
  }
};

export const sendWithBeacon = function(events: ExtendedEvent[]): boolean {
  if (config.needsToConfirmCookies()) return true;

  const events_were_logged = window.navigator.sendBeacon(
    EVENT_LOGGING_ENDPOINT,
    new Blob(
      [
        query_serializer.serialize(
          packageEvents([...events, ...get_device_data_events()])
        )
      ],
      {
        type: 'application/x-www-form-urlencoded'
      }
    )
  );

  if (!events_were_logged)
    getState().session = { sequenceID: 0, lastEventTime: 0, sessionID: '' };

  return events_were_logged;
};

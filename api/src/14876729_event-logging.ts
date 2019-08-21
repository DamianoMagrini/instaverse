/**
 * @module event-logging
 *
 * Main module for logging events.
 *
 * Dependencies:
 *  - events (9568347)
 *  - banzai-shared (14876728)
 *  - http (9568364)
 *  - falco (9830523)
 *  - throw-error-async (9568361)
 *  - banzai-actions-constants (9568349)
 *  - query-serializer (14680200)
 *  - visibility-change (12255279)
 *  - event-listeners (14876732)
 */

import * as events from './9568347_events';
import * as banzai_shared from './14876728_banzai-shared';
import * as http from './9568364_http';
import * as falco from './9830523_falco';
import throw_error_async from './9568361_throw-error-async';
import * as BANZAI_ACTIONS_CONSTANTS from './9568349_banzai-actions-constants';
import query_serializer from './14680200_query-serializer';
import visibility_change from './12255279_visibility-change';
import * as event_listeners from './14876732_event-listeners';

import { BanzaiEvent } from './9568348_banzai';
import { ExtendedError } from './14876720_extended-error';

type Events = { posts: BanzaiEvent[]; [key: string]: any }[];

const requests_history: XMLHttpRequest[] = [];
const subscriptions: { [key: string]: (() => void)[] } = {};

export const inform = (event_name: string) => {
  (subscriptions[event_name] || []).forEach((subscription) => subscription());
};

export const subscribe = (event_name: string, subscription: () => void) => {
  if (!subscriptions[event_name]) subscriptions[event_name] = [];
  subscriptions[event_name].push(subscription);
};

export const cleanup = () => {
  for (const request of requests_history)
    if (request.readyState < 4) request.abort();
  /*
    That's a clever way to clear an array without reassigning it. I might
    want to write it down somewhere. Pft... who am I fooling? It would just
    get lost in my 145-and-counting-exponentially Google Keep notes. I swear
    they were 136 two days ago... 104 last week... 80-something last month...
    . . .
  */
  requests_history.splice(0, requests_history.length);
};

export const readyToSend = () => navigator.onLine;

export const _classifyEvents = (events_to_classify: Events) => {
  const bzPayload = [];
  const falcoPayload: events.ExtendedEvent[] = [];
  const pigeonEvents: events.ExtendedEvent[] = [];

  for (const event of events_to_classify) {
    const posts = [];
    for (const post of event.posts) {
      const [type, data] = post;
      switch (type) {
        case 'pigeon':
          pigeonEvents.push(data);
          break;
        case 'falco':
          falcoPayload.push(data);
          break;
        default:
          posts.push(post);
      }
    }
    if (posts.length > 0) bzPayload.push({ ...event, posts });
  }

  return { bzPayload, falcoPayload, pigeonEvents };
};

export const send = (
  events_to_send: Events,
  callback: () => void,
  catch_error: (status_code: number) => void,
  silent = false
) => {
  const events_by_type: [
    Promise<Response | void>?,
    Promise<Response | void>?,
    Promise<Response | void>?
  ] = [];

  const { bzPayload, falcoPayload, pigeonEvents } = _classifyEvents(
    events_to_send
  );

  if (pigeonEvents.length > 0)
    events_by_type.push(
      events.send(pigeonEvents, {
        timeout: banzai_shared.SEND_TIMEOUT,
        referenceToXhr: (xhr) => requests_history.push(xhr)
      })
    );

  if (bzPayload.length > 0)
    events_by_type.push(
      http.post(
        '/ajax/bz',
        { q: JSON.stringify(bzPayload), ts: Date.now() },
        {
          dataType: 'post',
          omitLanguageParam: true,
          timeout: banzai_shared.SEND_TIMEOUT
        },
        (xhr) => requests_history.push(xhr)
      )
    );

  if (falcoPayload.length > 0)
    events_by_type.push(
      falco
        .falcoSend(falcoPayload, (xhr) => requests_history.push(xhr))
        .then((response) => response, () => {})
    );

  throw_error_async(
    Promise.all(events_by_type)
      .then(() => {
        if (callback) callback();
        if (!silent) inform(BANZAI_ACTIONS_CONSTANTS.OK);
      })
      .catch((error: ExtendedError) => {
        if (catch_error) catch_error(error.statusCode);
        if (!silent) inform(BANZAI_ACTIONS_CONSTANTS.ERROR);
      })
  );
};

export const sendWithBeacon = (events_to_send: Events): boolean => {
  let successful: boolean;
  const { bzPayload, falcoPayload, pigeonEvents } = _classifyEvents(
    events_to_send
  );

  if (pigeonEvents.length > 0) successful = events.sendWithBeacon(pigeonEvents);
  if (bzPayload.length > 0)
    successful =
      window.navigator.sendBeacon(
        '/ajax/bz',
        new Blob(
          [
            query_serializer.serialize({
              q: JSON.stringify(bzPayload),
              ts: String(Date.now())
            })
          ],
          { type: 'application/x-www-form-urlencoded' }
        )
      ) && successful;
  if (falcoPayload.length > 0)
    successful = falco.falcoSendWithBeacon(falcoPayload) && successful;

  return successful;
};

export const setHooks = (
  on_hidden: (this: Window, event: Event) => boolean | void,
  on_visible: (this: Window, event: Event) => boolean | void
) => {
  visibility_change.addListener('hidden', on_hidden);
  visibility_change.addListener('visible', on_visible);
  event_listeners.add(window, 'pagehide', on_hidden);
  event_listeners.add(window, 'pageshow', on_visible);
  event_listeners.add(window, 'blur', on_hidden);
  event_listeners.add(window, 'focus', on_visible);
};

export const setUnloadHook = (
  listener: (this: Window, event: Event) => boolean | void
) => {
  event_listeners.add(window, 'unload', listener);
};

subscribe(BANZAI_ACTIONS_CONSTANTS.STORE, events.store);

/// <reference path="index.d.ts" />

/**
 * @module ig-lite-bindings
 *
 * Bindings with the IG Lite app.
 *
 * Dependencies:
 *  - storage (9699368)
 *  - ig-lite-events (9699337)
 *  - user-agent (9568276)
 *  - config (9568270)
 *  - cookies (9568399)
 *  - known-cookies (9568400)
 *  - push-notifications (9961594)
 *  - logging (9568346)
 *  - events (9568347)
 *  - guard (9830596)
 *  - unknown (9568293)
 *  - error-utils (9699359)
 */

import * as storage from './9699368_storage';
import * as ig_lite_events from './9699337_ig-lite-events';
import * as user_agent from './9568276_user-agent';
import * as config from './9568270_config';
import * as cookies from './9568399_cookies';
import KNOWN_COOKIES from './9568400_known-cookies';
import * as push_notifications from './9961594_push-notifications';
import * as logging from './9568346_logging';
import * as events from './9568347_events';
import * as guard from './9830596_guard';
import * as timings from './9568293_timings';
import * as error_utils from './9699359_error-utils';

const FEED_PAGE_KEY = 'FeedPage';
const STORY_TRAY_KEY = 'StoryTray';
export const _coldStartComponentsDisplayDone = {
  [FEED_PAGE_KEY]: false,
  [STORY_TRAY_KEY]: false
};
let starting_up = false;

const get_fcm_push_token = () =>
  window.IG_LITE_JS_BRIDGE && window.IG_LITE_JS_BRIDGE.getFcmPushToken;

export const logIgLiteAction = (action_data: {
  extras?: object;
  [key: string]: any;
}) => {
  if (!user_agent.isIgLite()) return;
  const action = { ...action_data, extras: JSON.stringify(action_data.extras) };
  logging.logPigeonEvent(
    events.createEvent('instagram_lite_client_events', logging.getExtra(action))
  );
};

export const _notifyColdStartComplete = () => {
  if (
    _coldStartComponentsDisplayDone[FEED_PAGE_KEY] &&
    _coldStartComponentsDisplayDone[STORY_TRAY_KEY]
  )
    markIgLiteColdStartFinished();
};

export const markIgLiteColdStartFinished = () => {
  if (!starting_up) {
    const session_storage = storage.getSessionStorage();
    if (
      _coldStartComponentsDisplayDone[FEED_PAGE_KEY] &&
      _coldStartComponentsDisplayDone[STORY_TRAY_KEY] &&
      session_storage &&
      session_storage.getItem('coldStartDone') !== 'true'
    ) {
      const session_id = events.getState().session.sessionID;
      ig_lite_events.notifyFirstPageLoadFinishedWithSessionId(session_id);
      starting_up = true;
      guard.guard(() => {
        session_storage.setItem('coldStartDone', 'true');
      });
      if (timings.isPerformanceMarkerSupported()) {
        performance.mark('coldStart-end');
        performance.measure('coldStart', 'fetchStart', 'coldStart-end');
      }
    } else {
      starting_up = true;
      ig_lite_events.notifyCancelPageLoad();
    }
  }
};

export const readIgLiteTokens = () => {
  const local_storage = storage.getLocalStorage();
  if (local_storage !== null)
    return {
      phoneId: local_storage.getItem(ig_lite_events.PHONE_ID_KEY),
      fbToken: local_storage.getItem(ig_lite_events.FB_TOKEN_KEY)
    };
  return { phoneId: null, fbToken: null };
};

export const registerIgLiteClientPush = () => {
  if (
    user_agent.isIgLite() &&
    config.isLoggedIn() &&
    cookies.getCookie(KNOWN_COOKIES.USER_ID)
  )
    if (get_fcm_push_token()) {
      logIgLiteAction({ event_name: 'register_push_attempt_fcm' });
      const fcm_push_token = ig_lite_events.getFcmPushToken();
      if (fcm_push_token)
        push_notifications.registerPushClient(
          fcm_push_token,
          'android_lite_fcm',
          {
            guid: ig_lite_events.getGUID()
          }
        );
    } else {
      logIgLiteAction({ event_name: 'register_push_attempt_gcm' });
      const push_token = ig_lite_events.getPushToken();
      if (push_token)
        push_notifications.registerPushClient(push_token, 'android_lite_gcm', {
          guid: ig_lite_events.getGUID()
        });
    }
};

export const markIgLiteDisplayDone = (component: 'FeedPage' | 'StoryTray') => {
  if (
    !starting_up ||
    !(component !== FEED_PAGE_KEY && component !== STORY_TRAY_KEY)
  ) {
    _coldStartComponentsDisplayDone[component] = true;
    _notifyColdStartComplete();
  }
};

export const _resetColdStartComplete = () => {
  starting_up = false;
  _coldStartComponentsDisplayDone[FEED_PAGE_KEY] = false;
  _coldStartComponentsDisplayDone[STORY_TRAY_KEY] = false;
};

export const base64toBlob = (
  base64: string,
  type: string = '',
  block_length: number = 512
) => {
  try {
    const decoded_string = atob(base64);
    const parts = [];

    for (let index = 0; index < decoded_string.length; index += block_length) {
      const block = decoded_string.slice(index, index + block_length);
      const char_codes = new Array(block.length);
      for (let index = 0; index < block.length; index++)
        char_codes[index] = block.charCodeAt(index);
      parts.push(new Uint8Array(char_codes));
    }

    return new Blob(parts, { type });
  } catch {
    error_utils.logError(new Error('base64toBlobfailed'));
    return null;
  }
};

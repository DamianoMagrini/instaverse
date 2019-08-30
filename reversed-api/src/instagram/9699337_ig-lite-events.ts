/**
 * @module ig-lite-events
 *
 * Event bindings with the IG Lite app.
 *
 * Dependencies:
 *  - user-agent (9568276)
 *  - guard (9830596)
 *  - unknown (9830461)
 *  - error-utils (9699359)
 *  - storage (9699368)
 */

import * as user_agent from './9568276_user-agent';
import * as guard from './9830596_guard';
import * as ig_lite_bindings from './9830461_ig-lite-bindings';
import * as error_utils from './9699359_error-utils';
import * as storage from './9699368_storage';

const ANDROID_PERMISSION_PREFIX = 'android.permission.';
export const PHONE_ID_KEY = 'ig_phone_id';
export const FB_TOKEN_KEY = 'big_blue_token';

export const ANDROID_MANIFEST_PERMISSIONS = { readContacts: 'READ_CONTACTS' };
export const ANDROID_PERMISSION_STATUS = {
  PERMISSION_GRANTED: 0,
  PERMISSION_DENIED: 1,
  PERMISSION_PERMANENTLY_DENIED: 2
};

const ig_lite_bridge_present =
  typeof IG_LITE_JS_BRIDGE !== 'undefined' && user_agent.isIgLite();
const ig_lite_bridge_debug_present =
  typeof IG_LITE_JS_BRIDGE_DEBUG !== 'undefined' && user_agent.isIgLite();

let import_contacts_request_pending = false;

type ImportContactsSuccessCallback = (
  contacts: string,
  failed: boolean
) => void;
let import_contacts_success_callbacks: ImportContactsSuccessCallback[] = [];

type OnGauthTokensAvailableCallback = (tokens_string: string) => void;
let on_gauth_tokens_available_callbacks: OnGauthTokensAvailableCallback[] = [];

type OnImageAvailableCallback = (image: any) => void;
let on_image_available_callbacks: OnImageAvailableCallback[] = [];

type OnNetworkInfoAvailableCallback = (
  data_1: string,
  data_2: string,
  failed: boolean
) => void;
let on_network_info_available_callbacks: OnNetworkInfoAvailableCallback[] = [];

type OnVideoAvailableCallback = (video: any) => void;
let on_video_available_callbacks: OnVideoAvailableCallback[] = [];
export const enablePullToRefresh = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => IG_LITE_JS_BRIDGE.enablePullToRefresh());
};
export const disablePullToRefresh = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => IG_LITE_JS_BRIDGE.disablePullToRefresh());
};

const onImportContactsSuccess = (contacts: string) => {
  if (contacts.length)
    ig_lite_bindings.logIgLiteAction({ event_name: 'contactsImportSuccess' });
  else ig_lite_bindings.logIgLiteAction({ event_name: 'contactsImportEmpty' });

  import_contacts_request_pending = false;
  import_contacts_success_callbacks.forEach((callback) =>
    callback(contacts, false)
  );
  import_contacts_success_callbacks = [];
};
const onImportContactsError = () => {
  import_contacts_request_pending = false;
  error_utils.logError(new Error('IG Lite: Import Contacts failed'));

  import_contacts_success_callbacks.forEach((callback) => callback('', true));
  import_contacts_success_callbacks = [];
};

const onPhoneIdAvailable = (id: string) => {
  const local_storage = storage.getLocalStorage();
  local_storage !== null && local_storage.setItem(PHONE_ID_KEY, id);
};
const onPhoneIdUnavailable = () => {
  localStorage.removeItem(PHONE_ID_KEY),
    error_utils.logError(
      new Error(
        'IG Lite: Phone ID unavailable -- wiping phone ID from local storage'
      )
    );
};

const onFbTokenAvailable = (token: string) => {
  const local_storage = storage.getLocalStorage();
  local_storage !== null && local_storage.setItem(FB_TOKEN_KEY, token);
};
const onFbTokenUnavailable = () => {
  localStorage.removeItem(FB_TOKEN_KEY),
    error_utils.logError(
      new Error(
        'IG Lite: FB Token unavailable -- wiping FB token from local storage'
      )
    );
};

const onGauthTokensAvailable = (tokens: object) => {
  const tokens_string = JSON.stringify(tokens);
  on_gauth_tokens_available_callbacks.forEach((callback) =>
    callback(tokens_string)
  );
  on_gauth_tokens_available_callbacks = [];
};
const onGauthTokensUnAvailable = () => {
  error_utils.logError(new Error('IG Lite: Gauth tokens bridge call failed'));
};

const onImageAvailable = (image: any) => {
  on_image_available_callbacks.forEach((callback) => callback(image));
  on_image_available_callbacks = [];
};
const onImageUnavailable = () => {
  error_utils.logError(new Error('IG Lite: Image bridge call failed'));
};

const onVideoAvailable = (video: any) => {
  on_video_available_callbacks.forEach((callback) => callback(video));
  on_video_available_callbacks = [];
};
const onVideoUnavailable = () => {
  error_utils.logError(new Error('IG Lite: Video bridge call failed'));
};

const onNetworkInfoAvailable = (data_1: string, data_2: string) => {
  on_network_info_available_callbacks.forEach((callback) =>
    callback(data_1, data_2, false)
  );
  on_network_info_available_callbacks = [];
};
const onNetworkInfoUnavailable = () => {
  error_utils.logError(new Error('IG Lite: NetworkInfo bridge call failed'));
  on_network_info_available_callbacks.forEach((callback) =>
    callback('', '', true)
  );
  on_network_info_available_callbacks = [];
};

export const getDevServer = () =>
  ig_lite_bridge_debug_present
    ? guard.guard(() => IG_LITE_JS_BRIDGE_DEBUG.getDevServer())
    : '';
export const setDevServer = (address: string) => {
  ig_lite_bridge_debug_present &&
    guard.guard(() => {
      IG_LITE_JS_BRIDGE_DEBUG.setDevServer(address);
    });
};

export const enableFullscreen = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => IG_LITE_JS_BRIDGE.enableFullscreen()),
      disablePullToRefresh();
};
export const disableFullscreen = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => IG_LITE_JS_BRIDGE.disableFullscreen()),
      enablePullToRefresh();
};

export const getPushToken = () =>
  ig_lite_bridge_present
    ? guard.guard(
        () => {
          const push_token = IG_LITE_JS_BRIDGE.getPushToken();
          if (!push_token || push_token === '')
            ig_lite_bindings.logIgLiteAction({
              event_name: 'pushTokenEmptyFromBridge'
            });
          return push_token;
        },
        null,
        [],
        () => (
          ig_lite_bindings.logIgLiteAction({
            event_name: 'pushTokenUnavailableFromBridge'
          }),
          ''
        )
      )
    : '';

export const getFcmPushToken = () =>
  ig_lite_bridge_present
    ? guard.guard(
        () => {
          const fcm_push_token = IG_LITE_JS_BRIDGE.getFcmPushToken();
          if (!fcm_push_token || fcm_push_token === '')
            ig_lite_bindings.logIgLiteAction({
              event_name: 'fcmPushTokenEmptyFromBridge'
            });
          return fcm_push_token;
        },
        null,
        [],
        () => (
          ig_lite_bindings.logIgLiteAction({
            event_name: 'fcmPushTokenUnavailableFromBridge'
          }),
          ''
        )
      )
    : '';

export const getGUID = () =>
  ig_lite_bridge_present
    ? guard.guard(() => IG_LITE_JS_BRIDGE.getGUID(), null, [], () => '')
    : '';

export const getPermissionStatus = (permission_name: string) =>
  ig_lite_bridge_present
    ? guard.guard(() =>
        IG_LITE_JS_BRIDGE.getPermissionStatus(
          ANDROID_PERMISSION_PREFIX + permission_name
        )
      )
    : null;

export const setUserId = (new_id: string) => {
  if (ig_lite_bridge_present && typeof new_id === 'string')
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.setUserId(new_id);
    });
};

export const getLastUsedUserName = () =>
  ig_lite_bridge_present
    ? guard.guard(
        () => IG_LITE_JS_BRIDGE.getLastUsedUserName(),
        null,
        [],
        () => ''
      )
    : '';
export const setLastUsedUserName = (username: string) => {
  if (ig_lite_bridge_present && typeof username === 'string')
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.setLastUsedUserName(username);
    });
};

export const clearUserId = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.clearUserId();
    });
};

export const requestImportContacts = (
  callback: ImportContactsSuccessCallback
) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      if (!import_contacts_request_pending) {
        ig_lite_bindings.logIgLiteAction({
          event_name: 'requestImportContacts'
        });
        IG_LITE_JS_BRIDGE.requestImportContacts();
      }
      import_contacts_success_callbacks.push(callback);
      import_contacts_request_pending = true;
    });
};
export const registerImportContactsSuccessCallback = (
  callback: ImportContactsSuccessCallback
) => {
  import_contacts_success_callbacks.push(callback);
};

export const getPhoneIDAsync = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.getPhoneIDAsync();
    });
};

export const getFbTokenAsync = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.getFbTokenAsync();
    });
};

export const getGauthTokensAsync = (
  callback: OnGauthTokensAvailableCallback
) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.getGauthTokensAsync();
    }),
      on_gauth_tokens_available_callbacks.push(callback);
};

export const notifyCancelPageLoad = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.notifyCancelPageLoad();
    });
};
export const notifyFirstPageLoadFinished = () => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.notifyFirstPageLoadFinished();
    });
};
export const notifyFirstPageLoadFinishedWithSessionId = (
  session_id: string
) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.notifyFirstPageLoadFinishedWithSessionId(session_id);
    });
};

export const getImageGalleryAsync = (callback: OnImageAvailableCallback) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.getImageGalleryAsync();
    });
  on_image_available_callbacks.push(callback);
};

export const getVideoGalleryAsync = (callback: OnVideoAvailableCallback) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.getVideoGalleryAsync();
    }),
      on_video_available_callbacks.push(callback);
};

export const getImageCameraAsync = (callback: OnImageAvailableCallback) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.getImageCameraAsync();
    });
  on_image_available_callbacks.push(callback);
};

export const getNetworkTypeAsync = (
  callback: OnNetworkInfoAvailableCallback
) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.getNetworkTypeAsync();
    }),
      on_network_info_available_callbacks.push(callback);
};

export const isWhatsAppInstalled = () =>
  ig_lite_bridge_present &&
  guard.guard(() => IG_LITE_JS_BRIDGE.isWhatsAppInstalled());

export const shareToWhatsApp = (message: string) => {
  if (ig_lite_bridge_present)
    guard.guard(() => {
      IG_LITE_JS_BRIDGE.shareToWhatsApp(message);
    });
};

// Bind event handlers to Instagram Lite events.
if (ig_lite_bridge_present && IG_LITE_JS_BRIDGE)
  Object.assign(IG_LITE_JS_BRIDGE, {
    onImportContactsSuccess,
    onImportContactsError,
    onPhoneIdAvailable,
    onPhoneIdUnavailable,
    onFbTokenAvailable,
    onFbTokenUnavailable,
    onGauthTokensAvailable,
    onGauthTokensUnAvailable,
    onImageAvailable,
    onImageUnavailable,
    onVideoAvailable,
    onVideoUnavailable,
    onNetworkInfoAvailable,
    onNetworkInfoUnavailable
  });

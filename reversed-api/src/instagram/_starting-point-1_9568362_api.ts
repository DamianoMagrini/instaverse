/**
 * @module api
 *
 * Interfaces with the Instagram API.
 *  - http (9568364)
 *  - log-error (9568324)
 *  - mid (9699338)
 *  - invariant-ex (9502825)
 *  - filter-object (10289286)
 *  - performance (former 9961516, now fbts/performance)
 *  - log-performance (9961525)
 *  - paths (9568262)
 *  - image-metadata (11927566)
 *  - media-constants (11862025)
 *  - log-camera (9568306)
 *  - user-agent (9568276)
 *  - cookies-internal (1)
 *  - cookies (9568399)
 *  - uri (9830509)
 */

import * as http from './9568364_http';
import log_error from './9568324_log-error';
import * as mid from './9699338_mid';
import invariant_ex from './9502825_invariant-ex';
import filter_object from './10289286_filter-object';
import performance from '../fbts/performance';
import * as log_performance from './9961525_log-performance';
import * as PATHS from './9568262_paths';
import image_metadata from './11927566_image-metadata';
import * as MEDIA_CONSTANTS from './11862025_media-constants';
import * as log_camera from './9568306_log-camera';
import * as user_agent from './9568276_user-agent';
import cookies_internal, { Cookies } from './1_cookies-internal';
import * as cookies from './9568399_cookies';
import uri from './9830509_uri';

interface UserData {
  username?: string;
  first_name?: string;
  biography?: string;
  external_url?: string;

  captcha?;
  phone_number?: string;
  email?: string;
  password?: string;

  subno_key?;
  sms_code?;
  client_id?;
  seamless_login_enabled?: boolean;
  gdpr_s?;
  tos_version?;
  phone_id?;
  opt_into_one_tap?: boolean;
  big_blue_token?;
  fb_access_token?: string;
  profile_pic_size?;
  gender?;
  chaining_enabled?: 'on' | '';
  is_private?: boolean;
  bypass_rate_limit_dialog?: '0' | '1';
  fb_token?;
}

interface UserDataInternal {
  username?: string;
  fullName?: string;
  biography?: string;
  external_url?: string;

  emailOrPhone?: string;
  captcha?;
  phoneNumber?: string;
  email?: string;
  password?: string;

  subnoKey?;
  smsCode?;
  clientId?;
  seamlessLoginEnabled?: boolean;
  gdpr_s?;
  tosVersion?;
  phoneId?;
  optIntoOneTap?: boolean;
  big_blue_token?;
  fb_access_token?: string;
  profile_pic_size?;
  gender?;
  chaining_enabled?: 'on' | '';
  is_private?: boolean;
  bypass_rate_limit_dialog?: '0' | '1';
  fbToken?;
}

interface Photo {
  entityName: string;
  uploadId: string;
  uploadMediaHeight: number;
  uploadMediaWidth: number;
  file: {
    size: number;
    type: string;
    slice: (start: number, end: number, type: string) => string;
  };
}

interface Video extends Photo {
  isIgtvVideo?: boolean;
  uploadMediaDurationMs: number;
  fileByteOffset?: number;
  videoTransform?: string;
  mediaPublishMode: MEDIA_CONSTANTS.MediaPublishMode;
  chunkSize: number;
}

type ProcessDataCallback<ReturnType> = (data: {
  sent: number;
  successfullyAcknowledged: number;
  total: number;
}) => ReturnType;

const GRAPHQL_QUERY_ENDPOINT = '/graphql/query/';
const GENERATE_CREDIT_CARD_TOKEN_ENDPOINT =
  'https://secure.facebook.com/payments/generate_token';

const SIGNUP_OPERATIONS_TIMEOUT = 10000;
const CHANGE_PROFILE_PIC_TIMEOUT = 120000;
const LOGIN_OPERATIONS_TIMEOUT = 10000;
const TWO_FACTOR_AUTH_SMS_MIN_DELAY = 30000;
const IS_CONTACT_TAKEN_TIMEOUT = 10000;
const GRAPHQL_TIMEOUT = 30000;

let current_mutation_id = 0;

export const transferProgressObjectToOptimisticPercent = (progress: {
  total: number;
  sent: number;
}) => (progress.total ? Math.floor((progress.sent / progress.total) * 100) : 0);

const return_arg = <ArgType>(arg: ArgType): ArgType => arg;

const without_blacklisted_cookies = <ArgTypes extends any[], ReturnType>(
  callback: (...args: ArgTypes) => ReturnType
) => (...args: ArgTypes): ReturnType => {
  let removed_cookies: Cookies;
  const fb_cookie_enabled =
    log_camera.bool('felix_clear_fb_cookie', 'is_enabled') ||
    user_agent.isIgLite();

  if (fb_cookie_enabled) {
    const cookies_object = cookies_internal();
    const cookies_to_remove = get_blacklisted_cookies(cookies_object);
    removed_cookies = backup_cookies_to_remove(
      cookies_object,
      cookies_to_remove
    );
    cookies_to_remove.forEach((name) => cookies.setCookie(name, null));
  }

  const result = callback(...args);

  if (fb_cookie_enabled)
    setTimeout(() => {
      Object.keys(removed_cookies).forEach((name) => {
        cookies.setCookie(name, removed_cookies[name]);
      });
    }, 1000);

  return result;
};

const generate_before_request_cb = <ProcessedDataType>(
  callback: (processed_data: ProcessedDataType) => void,
  process_data: ProcessDataCallback<ProcessedDataType>
) =>
  callback
    ? (xhr: XMLHttpRequest) => {
        const original_handler = xhr.upload.onprogress;
        xhr.upload.onprogress = (event) => {
          const { loaded, total, lengthComputable } = event;
          if (lengthComputable && callback) {
            const processed_data = process_data({
              sent: loaded,
              successfullyAcknowledged: 0,
              total
            });
            callback(processed_data);
          }
          if (original_handler) original_handler.call(xhr, event);
        };
      }
    : null;

/*
  Note: this function took in a fourth `p` argument, but I removed it as it was
  not used.
*/
const http_request = <ProcessedDataType>(
  request_function: typeof http.post,
  callback: (processed_data: ProcessedDataType) => void,
  process_data: ProcessDataCallback<ProcessedDataType>
) => (url: string, data: any, options: http.ExtendedOptions) =>
  request_function(
    url,
    data,
    options,
    generate_before_request_cb(callback, process_data)
  ).then((response) => {
    if (callback && data instanceof Blob && response.statusCode < 300) {
      const processed_data = process_data({
        sent: data.size,
        successfullyAcknowledged: data.size,
        total: data.size
      });
      callback(processed_data);
    }
    return response;
  });

export const ruploadVideo = without_blacklisted_cookies(
  (video: Video, callback: ProcessDataCallback<any>) => {
    const {
      entityName,
      isIgtvVideo = false,
      uploadId,
      uploadMediaDurationMs,
      uploadMediaHeight,
      uploadMediaWidth,
      file,
      fileByteOffset = 0,
      videoTransform = null,
      mediaPublishMode
    } = video;
    const { chunkSize = file.size } = video;
    return http_request(http.post, callback, return_arg)(
      `/rupload_igvideo/${entityName}`,
      file.slice(fileByteOffset, fileByteOffset + chunkSize, file.type),
      {
        headers: {
          'X-Instagram-Rupload-Params': JSON.stringify({
            is_igtv_video: isIgtvVideo,
            media_type: MEDIA_CONSTANTS.MediaTypes.VIDEO,
            for_album:
              mediaPublishMode === MEDIA_CONSTANTS.MediaPublishMode.REEL,
            video_format: file.type,
            upload_id: uploadId,
            upload_media_duration_ms: uploadMediaDurationMs,
            upload_media_height: uploadMediaHeight,
            upload_media_width: uploadMediaWidth,
            video_transform: videoTransform
          }),
          'X-Entity-Name': entityName,
          'X-Entity-Length': String(file.size),
          Offset: String(fileByteOffset)
        },
        timeout: Number.POSITIVE_INFINITY
      }
    );
  }
);

const upload_media = (
  media: Photo | Video,
  before_request: (xhr: XMLHttpRequest) => void,
  media_type: number
) => {
  const {
    entityName,
    file,
    fileByteOffset = 0,
    uploadId,
    uploadMediaHeight,
    uploadMediaWidth
  } = media as Video;
  const { chunkSize = file.size } = media as Video;

  return http.post(
    `/rupload_igphoto/${entityName}`,
    file.slice(fileByteOffset, fileByteOffset + chunkSize, file.type),
    {
      headers: {
        'X-Instagram-Rupload-Params': JSON.stringify({
          media_type,
          upload_id: uploadId,
          upload_media_height: uploadMediaHeight,
          upload_media_width: uploadMediaWidth
        }),
        'X-Entity-Name': entityName,
        'X-Entity-Length': String(file.size),
        Offset: String(fileByteOffset)
      },
      timeout: Number.POSITIVE_INFINITY
    },
    before_request
  );
};

export const ruploadPhoto = without_blacklisted_cookies(
  (photo: Photo, process_data?: ProcessDataCallback<any>) =>
    upload_media(
      photo,
      process_data
        ? generate_before_request_cb(process_data, return_arg)
        : undefined,
      MEDIA_CONSTANTS.MediaTypes.VIDEO
    )
);

export const uploadPhoto = without_blacklisted_cookies(
  (photo: Photo, before_request?: (xhr: XMLHttpRequest) => any) =>
    upload_media(photo, before_request, MEDIA_CONSTANTS.MediaTypes.IMAGE)
);

const sign_up_internal = (
  user_data: UserDataInternal,
  dry_run: boolean,
  callback?: (xhr: XMLHttpRequest) => void
) => {
  const { email, password, phoneNumber, username } = user_data;
  invariant_ex(
    (email !== null || phoneNumber !== null || username !== null) &&
      password !== null
  );

  const data: UserData = {
    captcha: user_data.captcha,
    email,
    password,
    phone_number:
      typeof user_data.phoneNumber === 'string' ? user_data.phoneNumber : null,
    subno_key: user_data.subnoKey,
    username: username,
    first_name: user_data.fullName
  };

  if (typeof user_data.smsCode === 'string') data.sms_code = user_data.smsCode;
  if (typeof user_data.clientId === 'string')
    data.client_id = user_data.clientId;
  if (typeof user_data.seamlessLoginEnabled === 'string')
    data.seamless_login_enabled = user_data.seamlessLoginEnabled;
  if (typeof user_data.gdpr_s === 'string') data.gdpr_s = user_data.gdpr_s;
  if (typeof user_data.tosVersion === 'string')
    data.tos_version = user_data.tosVersion;
  if (typeof user_data.phoneId === 'string') data.phone_id = user_data.phoneId;
  'boolean' == typeof user_data.optIntoOneTap &&
    (data.opt_into_one_tap = user_data.optIntoOneTap);
  if (typeof user_data.fbToken === 'string')
    data.big_blue_token = user_data.fbToken;

  return http.post(
    '/accounts/web_create_ajax/' + (dry_run ? 'attempt/' : ''),
    filter_object(
      data,
      (value, key) => typeof value === 'string' || typeof value === 'boolean'
    ),
    { timeout: SIGNUP_OPERATIONS_TIMEOUT },
    callback
  );
};

const sign_up_with_fb = (
  user_data: UserDataInternal,
  fb_access_token: string,
  is_attempt: boolean,
  before_request?: (xhr: XMLHttpRequest) => void
) => {
  const data: UserData = {
    fb_access_token,
    first_name: user_data.fullName,
    username: user_data.username
  };
  user_data.password !== null && (data.password = user_data.password);
  user_data.emailOrPhone && (data.email = user_data.emailOrPhone);
  user_data.tosVersion !== null && (data.tos_version = user_data.tosVersion);
  return http.post(
    '/fb/create/ajax/' + (is_attempt ? 'attempt/' : ''),
    data,
    { timeout: SIGNUP_OPERATIONS_TIMEOUT },
    before_request
  );
};

const c = () => {
  return Date.now().toString();
};

const get_whitelist_and_blacklist = (): {
  whitelist?: string[];
  blacklist?: string[];
} =>
  ['whitelist', 'blacklist'].reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: (log_camera.string('felix_clear_fb_cookie', key) || '')
        .split(',')
        .filter(Boolean)
    }),
    {}
  );

const filter_blacklisted_cookies = (
  cookies_object: Cookies,
  whitelist: string[]
) => Object.keys(cookies_object).filter((name) => !whitelist.includes(name));

const get_blacklisted_cookies = (cookies_object: Cookies) => {
  const { whitelist, blacklist } = get_whitelist_and_blacklist();
  return whitelist.length > 0
    ? filter_blacklisted_cookies(cookies_object, whitelist)
    : blacklist;
};

const backup_cookies_to_remove = (
  cookies_object: Cookies,
  cookies_to_remove: string[]
): Cookies =>
  cookies_to_remove.reduce(
    (accumulator, name) => ({ ...accumulator, [name]: cookies_object[name] }),
    {}
  );

export const reelSeen = function(t, n) {
  var o;
  return http
    .post('/stories/reel/seen', {
      reelMediaId: t.id,
      reelMediaOwnerId:
        null === t || undefined === t
          ? undefined
          : null === (o = t.owner) || undefined === o
          ? undefined
          : o.id,
      reelId: n.id,
      reelMediaTakenAt: t.postedAt,
      viewSeenAt: t.postedAt
    })
    .catch((error) => {
      log_error(error);
      throw error;
    });
};

export const approveFollowRequest = (t) =>
  http.post('/web/friendships/' + t + '/approve/');

export const ignoreFollowRequest = (t) =>
  http.post('/web/friendships/' + t + '/ignore/');

export const followAll = (t) =>
  http.post('/web/friendships/follow_all/', { user_ids: t });

export const showMany = (user_ids: string[]) =>
  http.post('/web/friendships/show_many/', {
    user_ids: user_ids.join(',')
  });

export const likePost = (post_id: number) =>
  http.post('/web/likes/' + post_id + '/like/');

export const unlikePost = (post_id: number) =>
  http.post('/web/likes/' + post_id + '/unlike/');

export const savePost = (post_id: number) =>
  http.post('/web/save/' + post_id + '/save/');

export const unsavePost = (post_id: number) =>
  http.post('/web/save/' + post_id + '/unsave/');

export const fetchParentalConsent = () =>
  http.get('/web/consent/fetch_parental_consent_reg/');

export const fetchUnconsentedConsents = () =>
  http.get('/web/consent/get/roadblocking');

export const acceptNewTerms = () => http.post('/terms/accept/');

export const updateNewUserConsent = function(
  new_data: { gdpr_s: any; dob: any; updates: any },
  current_screen_key: string
) {
  // Note to myself: dob stands for date of birth (I keep forgetting it)
  const { gdpr_s, dob, updates } = new_data;
  const data = { current_screen_key, ...dob, gdpr_s };
  if (updates) data.updates = JSON.stringify(updates);
  return http.post('/web/consent/new_user_flow/', data);
};

export const updateConsentState = (updates: any, current_screen_key: string) =>
  http.post('/web/consent/update/', {
    updates: JSON.stringify(updates),
    current_screen_key
  });

export const parentalConsentUpdate = function(
  action: string,
  pc_id: string,
  nonce: number,
  other_data: any,
  first_name: string,
  last_name: string
) {
  const parental_consent_data = {
    nonce,
    action,
    ...other_data,
    first_name,
    last_name,
    pc_id
  };
  return http.post(
    '/web/consent/parental_consent_action/',
    parental_consent_data
  );
};

export const sendDataDownloadEmail = (email: string) =>
  http.post('/download/request_download_data_ajax/', email);

export const resetConsentState = () =>
  http.post('/web/consent/reset_gdpr_consent/');

export const updateConsentDob = (dob: any, current_screen_key: string) =>
  http.post('/web/consent/update_dob/', {
    ...dob,
    current_screen_key
  });

export const sendParentalConsentEmail = (
  guardian_email: string,
  current_screen_key: string
) =>
  http.post('/web/consent/send_parental_consent_email/', {
    guardian_email,
    current_screen_key
  });

export const skipParentalConsent = (current_screen_key: string) =>
  http.post('/web/consent/update/', {
    action: 'skip',
    current_screen_key
  });

export const commentOnPost = function(
  post_id: string, //? Or number?
  comment_text: string,
  replied_to_comment_id: string //? Or number?
) {
  return http.post('/web/comments/' + post_id + '/add/', {
    comment_text,
    replied_to_comment_id
  });
};

export const deleteCommentOnPost = (t, n) =>
  http.post('/web/comments/' + t + '/delete/' + n + '/');

export const likeComment = (comment_id) =>
  http.post('/web/comments/like/' + comment_id + '/');

export const unlikeComment = (comment_id) =>
  http.post('/web/comments/unlike/' + comment_id + '/');

export const changeProfilePic = function(
  picture: string | Blob,
  callback: (processed_data: number) => void
) {
  const new_picture = new FormData();
  new_picture.append('profile_pic', picture, 'profilepic.jpg');
  return http.post(
    '/accounts/web_change_profile_picture/',
    new_picture,
    { dataType: 'formdata', timeout: CHANGE_PROFILE_PIC_TIMEOUT },
    callback
      ? generate_before_request_cb(
          callback,
          transferProgressObjectToOptimisticPercent
        )
      : undefined
  );
};

export const removeProfilePic = () =>
  http.post('/accounts/web_change_profile_picture/', {});

export const syncProfilePic = () =>
  http.post('/accounts/web_sync_profile_picture/', {});

export const logout = (_: any, enable_one_tap: boolean) =>
  http.post('/accounts/logout/ajax/', {
    one_tap_app_login: enable_one_tap ? 1 : 0
  });

export const requestSignupSMSCode = function(t, n, o, s) {
  return http.post(
    '/accounts/send_signup_sms_code_ajax/',
    { client_id: t, phone_number: n, phone_id: o, big_blue_token: s },
    { timeout: SIGNUP_OPERATIONS_TIMEOUT }
  );
};

export const validateSignupSMSCode = function(t, n, o) {
  return http.post(
    '/accounts/validate_signup_sms_code_ajax/',
    { client_id: t, phone_number: n, sms_code: o },
    { timeout: SIGNUP_OPERATIONS_TIMEOUT }
  );
};

export const requestUIGContactPrefillInformation = (t, n) =>
  http.post(
    '/accounts/contact_point_prefill/',
    {
      device_id: mid.getMID(),
      phone_id: String(t),
      big_blue_token: String(n)
    },
    { timeout: SIGNUP_OPERATIONS_TIMEOUT }
  );

export const signup = (user_data: UserDataInternal) =>
  sign_up_internal(user_data, false);

export const signupDryRun = (
  user_data: UserDataInternal,
  callback?: (xhr: XMLHttpRequest) => void
) => sign_up_internal(user_data, true, callback);

export const signupWithFB = (
  user_data: UserDataInternal,
  fb_access_token?: string
) => sign_up_with_fb(user_data, fb_access_token, false);

export const signupWithFBDryRun = function(
  user_data: UserDataInternal,
  fb_access_string: string,
  o: (xhr: XMLHttpRequest) => void
) {
  return sign_up_with_fb(user_data, fb_access_string, true, o);
};

export const connectAccountToFB = (
  fb_access_token: string,
  profile_pic_size
) => {
  const data: UserData = { fb_access_token };
  if (profile_pic_size !== null) data.profile_pic_size = profile_pic_size;
  return http.post('/fb/connect/ajax/', data, {
    timeout: SIGNUP_OPERATIONS_TIMEOUT
  });
};

export const login = function(
  username: string,
  password: string,
  queryParams?: any,
  optIntoOneTap?: boolean
) {
  return http.post(
    'https://www.instagram.com/accounts/login/ajax/',
    { username, password, queryParams, optIntoOneTap },
    { timeout: LOGIN_OPERATIONS_TIMEOUT }
  );
};

export const exchangeFBCode = function(code, returnURL) {
  return http.post(
    '/accounts/fb_code_exchange/',
    { code, returnURL },
    { timeout: LOGIN_OPERATIONS_TIMEOUT }
  );
};

export const oneTapLogin = function(t, n, o) {
  return http.post(
    '/accounts/one_tap_web_login/',
    { user_id: t, login_nonce: n, queryParams: o },
    { timeout: LOGIN_OPERATIONS_TIMEOUT }
  );
};

export const oneTapGetNonce = () =>
  http.post('/accounts/request_one_tap_login_nonce/', null, {
    timeout: LOGIN_OPERATIONS_TIMEOUT
  });

export const oneTapLoginRemove = (t) =>
  http.post(
    '/accounts/one_tap_web_remove_nonce/',
    { user_id: t },
    { timeout: LOGIN_OPERATIONS_TIMEOUT }
  );

export const sendConfirmEmail = () =>
  http.post('/accounts/send_confirm_email/');

export const sendTwoFactorEnableCode = (t) =>
  http.post('/accounts/two_factor_authentication/', {
    phone_number: t
  });

export const disableTwoFactorAuth = () =>
  http.post('/accounts/two_factor_authentication/ajax/disable/');

export const enableTwoFactorAuth = (t, n) =>
  http.post('/accounts/two_factor_authentication/ajax/enable/', {
    confirmation_code: n,
    phone_number: t
  });

export const disableTotpTwoFactorAuth = () =>
  http.post('/accounts/two_factor_authentication/disable_totp/');

export const clearUserSearchHistory = () =>
  http.post('/web/search/clear_search_history/');

export const viewMoreAccessData = function(t, n) {
  const o = `/accounts/access_tool/${t}?__a=1&cursor=${n}`;
  return http.get(o);
};

export const getTwoFactorBackupCodes = (
  options: http.ExtendedOptions = { refresh: false }
) =>
  http.post(
    '/accounts/two_factor_authentication/ajax/get_backup_codes/',
    options
  );

export const loginTwoFactor = function(
  username: string,
  verificationCode: string,
  identifier: string,
  queryParams: any
) {
  return http.post(
    '/accounts/login/ajax/two_factor/',
    {
      username,
      verificationCode,
      identifier,
      queryParams
    },
    { timeout: LOGIN_OPERATIONS_TIMEOUT }
  );
};

export const shouldRateLimitTwoFactorLoginSms = (t) =>
  t !== null && Date.now() - t < TWO_FACTOR_AUTH_SMS_MIN_DELAY;

export const sendTwoFactorLoginSms = (t, n) =>
  http.post(
    '/accounts/send_two_factor_login_sms/',
    { username: t, identifier: n },
    { timeout: LOGIN_OPERATIONS_TIMEOUT }
  );

export const loginWithFB = (t) =>
  http.post('/accounts/login/ajax/facebook/', t, {
    timeout: LOGIN_OPERATIONS_TIMEOUT
  });

export const loginWithGoogle = (t) =>
  http.post('/accounts/login/ajax/google/', t, {
    timeout: LOGIN_OPERATIONS_TIMEOUT
  });

export const confirmEmailWithGoogleTokens = (google_tokens) =>
  http.post('/accounts/process_contact_point_signals/', {
    google_tokens
  });

export const getActivityFeedData = () =>
  http.get('/accounts/activity/?__a=1', { include_reel: true });

export const markActivityFeedChecked = (timestamp) =>
  http.post('/web/activity/mark_checked/', { timestamp });

export const revokeAccess = (token) =>
  http.post('/oauth/revoke_access/', { token });

export const declineInvite = (t) =>
  http.post('/oauth/decline_platform_tester_invite/', {
    app_id: t
  });

export const acceptInvite = (t) =>
  http.post('/oauth/accept_platform_tester_invite/', {
    app_id: t
  });

export const isContactTaken = function(check_email, check_phone) {
  return http
    .get(
      '/accounts/is_contact_taken/',
      { check_email, check_phone },
      { timeout: IS_CONTACT_TAKEN_TIMEOUT }
    )
    .then((t) => ({
      emailTaken: !(!t || !t.email_taken),
      phoneTaken: !(!t || !t.phone_taken)
    }));
};

export const fetchFBInfo = (profile_id) =>
  http.post('/accounts/fb_profile/', profile_id);

export const getUsernameSuggestions = (t, n) =>
  http.post('/accounts/username_suggestions/', {
    email: t,
    name: n
  });

export const query = async (
  query_hash: string,
  query_params: object,
  options: http.ExtendedOptions,
  before_query: (xhr: XMLHttpRequest) => void
) => {
  const variables = JSON.stringify(query_params);
  const request_start = performance.now();

  const response = await http.get(
    GRAPHQL_QUERY_ENDPOINT,
    { query_hash, variables },
    {
      ...options,
      urlErrorFormatter: (url, data) => `${url}?query_hash=${data.query_hash}`
    },
    before_query
  );

  log_performance.logGraphQLQueryTiming(
    query_hash,
    Math.round(performance.now() - request_start)
  );

  return response;
};

export const setEmailPreference = (t, n) =>
  http.post(PATHS.EMAIL_PREFERENCES_PATH, {
    [t]: n ? 'subscribe' : 'unsubscribe'
  });

export const setCommentFilteringConfig = (t) =>
  http.post('/accounts/set_comment_filter_web/', {
    config_value: t ? 1 : 0
  });

export const saveCommentFilteringKeywords = (keywords) =>
  http.post('/accounts/set_comment_filter_keywords_web/', { keywords });

export const saveProfile = function(new_data) {
  const data: UserData = {
    first_name: new_data.fullName,
    email: new_data.email,
    username: new_data.username,
    phone_number: new_data.phoneNumber,
    biography: new_data.bio,
    external_url: new_data.website,
    chaining_enabled: new_data.chainingEnabled ? 'on' : ''
  };
  new_data.gender !== null && (data.gender = String(new_data.gender));
  return http.post(PATHS.PROFILE_EDIT_PATH, data);
};

export const changePassword = function(t, n, o) {
  return http.post(PATHS.PASSWORD_CHANGE_PATH, {
    old_password: t,
    new_password1: n,
    new_password2: o
  });
};

export const resetPassword = function(t, n) {
  const o = PATHS.ACCOUNT_RECOVERY_SEND_PATH;
  return http.post(o, {
    email_or_username: t,
    recaptcha_challenge_field: n
  });
};

export const flagUser = (t, actionTaken, source_name) =>
  http.post('/users/' + t + '/flag/', {
    source_name: source_name,
    actionTaken: actionTaken
  });

export const reportComment = function(t, n, reason_id) {
  return http.post(`/media/${t}/comment/${n}/flag/`, { reason_id });
};

export const reportMedia = function(t, reason_id) {
  return http.post('/media/' + t + '/flag/', { reason_id });
};

export const reportUser = function(t, reason_id) {
  return http.post('/users/' + t + '/report/', {
    source_name: 'profile',
    reason_id
  });
};

export const dismissChainingSuggestion = function(target_id, chaining_user_id) {
  return http.post('/web/discover/chaining_dismiss/', {
    target_id,
    chaining_user_id
  });
};

export const dismissAysfSuggestion = (t) =>
  http.post('/web/discover/aysf_dismiss/', { target_id: t });

export const deactivateAccount = (t, n) =>
  http.post('/accounts/remove/request/temporary/', {
    'deletion-reason': t,
    password: n
  });

export const loadLocationsDirectoryMoreCities = (t, n) =>
  http.post(`${PATHS.LOCATIONS_PATH}${t}/`, { page: n });

export const loadLocationsDirectoryMoreLocations = (t, n) =>
  http.post(`${PATHS.LOCATIONS_PATH}${t}/`, { page: n });

export const loadLocationsDirectoryMoreCountries = (t) =>
  http.post(PATHS.LOCATIONS_PATH, { page: t });

export const fbUploaderPhoto = function(t, n, o = c()) {
  return image_metadata(t)
    .then(({ height: s, width: c }) =>
      uploadPhoto(
        {
          entityName: `fb_uploader_${o}`,
          file: t,
          uploadId: o,
          uploadMediaHeight: s,
          uploadMediaWidth: c
        },
        n
      )
    )
    .then(() => ({ upload_id: o }));
};

export const creationFinalizeMedia = function(t, n, o, s, c, u, _ = null) {
  let p, l;
  return (
    o &&
      (p = {
        geotag_enabled: true,
        location: JSON.stringify({
          lat: o.lat,
          lng: o.lng,
          facebook_places_id: o.external_id
        })
      }),
    s.length > 0 &&
      (l = JSON.stringify({
        in: s.map((t) => ({
          user_id: t.userId,
          position:
            u === MEDIA_CONSTANTS.MediaTypes.IMAGE ? t.position : undefined
        }))
      })),
    http.post('/create/configure/', {
      upload_id: t,
      caption: n,
      ...p,
      usertags: l,
      custom_accessibility_caption: c,
      retry_timeout: _
    })
  );
};

export const creationFinalizeStory = (t, n) =>
  http.post('/create/configure_to_story/', {
    upload_id: t,
    caption: n
  });

export const creationLoadSuggestedGeoTags = (t) =>
  http.get('/location_search/', {
    latitude: t.latitude,
    longitude: t.longitude
  });

export const deletePost = (t) => http.post(`/create/${t}/delete/`);

export const extractTwoFactorChallengeIfPresent = function(t) {
  if (t instanceof http.AjaxError && 400 === t.statusCode) {
    let n;
    try {
      n = JSON.parse(t.responseText || '');
    } catch (t) {}
    if ('object' == typeof n && n.two_factor_required)
      return {
        identifier: n.two_factor_info.two_factor_identifier,
        lastFourDigits: n.two_factor_info.obfuscated_phone_number,
        totpTwoFactorOn: n.two_factor_info.totp_two_factor_on,
        smsTwoFactorOn: n.two_factor_info.sms_two_factor_on,
        username: n.two_factor_info.username
      };
  }
  return null;
};

export const fetchBatchQuickPromotions = (t, n) =>
  http.post(
    '/qp/batch_fetch_web/',
    {
      surfaces_to_queries: JSON.stringify(t),
      vc_policy: 'default',
      version: 1
    },
    {},
    n
  );

export const markDiscoverPageSeen = () =>
  http.post('/web/discover/mark_su_seen/');

export const contactInvitesOptOut = (t, n) =>
  http.post('/invites/contact_optout_confirmed/', {
    hashed_contact: t,
    signature: n
  });

export const setDisallowStoryReshare = (t) =>
  http.post('/users/set_disallow_story_reshare_web/', {
    disabled: t ? 1 : 0
  });

export const setFeedPostReshareDisabled = (t) =>
  http.post('/users/set_feed_post_reshare_disabled_web/', {
    disabled: t ? 1 : 0
  });

export const setGender = function(t, n) {
  const o = { gender: t, custom_gender: n };
  return http.post('/accounts/set_gender/', o);
};

export const setPresenceDisabled = (t) =>
  http.post('/accounts/set_presence_disabled/', {
    presence_disabled: t
  });

export const setPrivateAccount = function(t, n) {
  const o: UserData = { is_private: t };
  return (
    n && (o.bypass_rate_limit_dialog = '1'),
    http.post('/accounts/set_private/', o)
  );
};

export const setUsertagReviewPreference = (t) =>
  http.post('/web/usertags/review_preference_web/', {
    enabled: t ? 1 : 0
  });

export const reviewPhotosOfYou = function(t = '', n = '') {
  return http.post('/web/usertags/review_web/', {
    approve: t,
    remove: n
  });
};

export const untagFromTaggedMedia = (t) =>
  http.post('/web/usertags/untag_web/', { media: t });

export const fetchAccountRecoveryOptions = (t) =>
  http.post('/accounts/account_recovery_ajax/', { query: t });

export const sendAccountRecoveryEmail = (t) =>
  http.post('/accounts/send_account_recovery_email_ajax/', {
    query: t
  });

export const sendAccountRecoverySms = (t) =>
  http.post('/accounts/send_account_recovery_sms_ajax/', {
    query: t
  });

export const changePasswordAfterAccountRecovery = function(t, n, o) {
  return http.post('/accounts/recovery/password_reset/', {
    new_password1: t,
    new_password2: n,
    token: o
  });
};

export const avowLoginActivity = (t) =>
  http.post('/session/login_activity/avow_login/', {
    login_id: t
  });

export const undoAvowLoginActivity = (t) =>
  http.post('/session/login_activity/undo_avow_login/', {
    login_id: t
  });

export const disavowLoginActivity = (t) =>
  http.post('/session/login_activity/disavow_login_activity/', {
    login_id: t
  });

export const logOutLoginActivity = (t) =>
  http.post('/session/login_activity/logout_session/', {
    session_id: t
  });

export const IGTV_PUBLISH_MODE_DRAFT = 'igtv_draft';

export const IGTV_PUBLISH_MODE_POST = 'igtv';

export const configureToIgtv = function(t) {
  const {
    asyncConfigure: n = true,
    caption: o,
    publishMode: s,
    title: c,
    uploadId: u,
    fbPageAccessToken: _,
    igtvSharePreviewToFeed: p = false
  } = t;
  return http.post('/igtv/configure_to_igtv/', {
    async_configure: n ? '1' : undefined,
    caption: o,
    igtv_share_preview_to_feed: p ? '1' : undefined,
    publish_mode: s,
    title: c,
    upload_id: u,
    ...(_
      ? {
          fb_access_token: _,
          share_to_fb: '1',
          share_to_facebook: 'True'
        }
      : {})
  });
};

export const editMedia = function(t) {
  const {
    caption: n,
    mediaId: o,
    publishMode: s,
    title: c,
    igtvSharePreviewToFeed: u = false
  } = t;
  return http.post(`/media/${o}/edit/`, {
    caption: n,
    igtv_share_preview_to_feed: u,
    publish_mode: s,
    title: c
  });
};

export const checkPhoneNumber = (t) =>
  http.post('/accounts/check_phone_number/', {
    phone_number: t
  });

export const deleteContacts = () => http.post('/accounts/address_book/unlink/');

export const uploadContacts = (t) =>
  http.post('/accounts/address_book/link/', { contacts: t });

export const checkEmail = (t) =>
  http.post('/accounts/check_email/', { email: t });

export const getStickers = function(t) {
  const { user: n, location: o } = t;
  return http.post('/web/creatives/async_assets/', {
    user: n,
    location: o
  });
};

export const phoneConfirmSendSmsCode = (t) =>
  http.post('/accounts/phone_confirm_send_sms_code/', {
    phone_number: t
  });

export const phoneConfirmVerifySmsCode = (t, n) =>
  http.post('/accounts/phone_confirm_verify_sms_code/', {
    phone_number: t,
    verification_code: n
  });

export const postPermissionDialogResult = function(t, n, o, s, c) {
  const u = new uri('/oauth/authorize');
  return (
    u.addQueryData({ app_id: n, response_type: s, redirect_uri: o }),
    c !== null && u.addQueryData({ state: c }),
    http.post(u.toString(), { allow: t })
  );
};

export const getMidFromServer = () => http.get('/web/__mid/');

export const queryWWWGraphQL = function(doc_id: string, input = {}) {
  return (
    (input = { ...input, client_mutation_id: current_mutation_id++ }),
    http.post(
      '/web/wwwgraphql/ig/query/',
      { doc_id, variables: JSON.stringify({ input }) },
      { timeout: GRAPHQL_TIMEOUT }
    )
  );
};

export const generateCreditCardToken = (t) =>
  http.post(GENERATE_CREDIT_CARD_TOKEN_ENDPOINT, t);

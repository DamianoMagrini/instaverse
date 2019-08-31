/**
 * @module logging
 *
 * A module to log client events.
 *
 * Dependencies:
 *  - events (9568347)
 *  - banzai (9568348)
 *  - mid (9699338)
 *  - filter-object (10289286)
 *  - get-gatekeeper-fp (14876717)
 *  - config (9568270)
 *  - is-false (10092571)
 *  - uri-security (14680072)
 *  - user-agent (9568276)
 *  - error-utils (9699359)
 */

import * as events from './9568347_events';
import * as banzai from './9568348_banzai';
import * as mid from './9699338_mid';
import filter_object from './10289286_filter-object';
import get_gatekeeper_fp from './14876717_get-gatekeeper-fp';
import * as config from './9568270_config';
import is_false from './10092571_is-false';
import * as uri_security from './14680072_uri-security';
import * as user_agent from './9568276_user-agent';
import * as error_utils from './9699359_error-utils';

const EXPOSED_QES: object = window.__igExposedQEs || {};
if (!window.__igExposedQEs) window.__igExposedQEs = EXPOSED_QES;

const logger_plugins: (() => { [key: string]: any })[] = [];
let current_page_identifier = '';

events.onRequestFailed((data) => {
  banzai.post('pigeon_failed', data);
});

const log_pigeon_event = (
  event: events.ExtendedEvent,
  options?: banzai.PostOptions
) => {
  banzai.post('pigeon', event, options);
};

const get_gk = () => filter_object(get_gatekeeper_fp(), (value) => !!value);
const get_qe = () => filter_object(EXPOSED_QES, (value) => value !== '');

const get_anonymous_extra = (data: object) => ({
  ...filter_object(
    {
      canary: config.isCanary(),
      gk: get_gk(),
      pwa: config.isProgressiveWebApp(),
      qe: get_qe(),
      app_id: config.getIGAppID()
    },
    (value) => !is_false(value)
  ),
  ...data,
  ...logger_plugins.reduce(
    (accumulator, get_plugins) => ({ ...accumulator, ...get_plugins() }),
    {}
  )
});

function get_extra(data?: object) {
  const viewer_id = parseInt(config.getViewerId()) || 0;
  return {
    ...filter_object(
      {
        ig_userid: viewer_id,
        pk: viewer_id,
        rollout_hash: config.getRolloutHash()
      },
      (value) => !is_false(value)
    ),
    ...get_anonymous_extra(data)
  };
}

function trim_url(url: string) {
  const current_protocol_and_domain =
    window.location.protocol + '//' + window.location.host;
  return url && url.indexOf(current_protocol_and_domain) === 0
    ? url.substr(current_protocol_and_domain.length)
    : url;
}

const trim_and_sanitize_url = (url: string) =>
  trim_url(uri_security.sanitizeReferrer(url) || '');

const join_keys_and_values = (object: object) =>
  Object.keys(object)
    .map((key) => `${key}:${object[key]}`)
    .join('|');

function log_event(description: string, data: object) {
  const viewer_id = parseInt(config.getViewerId());
  log_pigeon_event(
    events.createEvent(description, {
      ...data,
      pk: viewer_id,
      gk: join_keys_and_values(get_gk()),
      qe: join_keys_and_values(get_qe())
    })
  );
}

export const setCurrentPageIdentifier = (new_page_identifier: string) => {
  current_page_identifier = new_page_identifier;
};

export const getCurrentPageIdentifier = () => current_page_identifier;

export const logAction_DEPRECATED = (
  name: string,
  data?: object,
  options?: banzai.PostOptions
) => {
  const { url, ...other_extra } = get_extra(data);
  log_pigeon_event(
    events.createEvent(
      'instagram_web_client_events',
      { event_type: 'action', event_name: name, ...other_extra },
      {
        obj_type: 'url',
        obj_id: trim_and_sanitize_url(url || window.location.href)
      }
    ),
    options
  );
};

export const logQuickPromotionEvent = (description: string, data: object) => {
  const { ig_userid } = get_extra(data);
  log_pigeon_event(
    events.createEvent(
      description,
      { pk: ig_userid, ...data },
      { module: 'quick_promotion' }
    ),
    {
      signal: true
    }
  );
};

export const logExposure = (
  qe: string,
  data: any,
  options: banzai.PostOptions
) => {
  banzai.post(
    'qe:expose',
    {
      qe,
      mid: mid.getMID().toUpperCase()
    },
    options
  );
  EXPOSED_QES[qe] = data;
};

export const logNotifLandingEvent = (data: object) => {
  const extra = get_extra(data);
  log_pigeon_event(
    events.createEvent('instagram_web_notification_landing', extra)
  );
};

export const logGatingEvent = (name: string, data: object) => {
  const { url, ...other_extra } = get_extra(data);
  other_extra.pk = '' + other_extra.ig_userid;
  log_pigeon_event(
    events.createEvent(
      'instagram_web_client_events',
      { event_type: 'action', event_name: name, ...other_extra },
      {
        module: other_extra.containermodule,
        obj_type: 'url',
        obj_id: trim_and_sanitize_url(url || window.location.href)
      }
    )
  );
};

export const logCompassionPartnerResourceEvent = function(o) {
  const { url, ..._ } = get_extra(o);
  log_pigeon_event(
    events.createEvent(
      'instagram_web_client_events',
      {
        event_type: 'action',
        event_name: 'compassion_partner_resource_event',
        ..._
      },
      {
        obj_type: 'url',
        obj_id: trim_and_sanitize_url(url || window.location.href)
      }
    )
  );
};

export const logPageView = function(
  module: string,
  data: object,
  options: banzai.PostOptions
) {
  const { url, ...other_extra } = get_extra(data);
  log_pigeon_event(
    events.createEvent(
      'instagram_web_client_events',
      { event_type: 'page_view', ...other_extra },
      {
        module: module,
        obj_type: 'url',
        obj_id: trim_and_sanitize_url(url || window.location.href)
      }
    ),
    options
  );
};

export const logScrollPerfEvent = function(data: {
  smallFrameDrops: number;
  largeFrameDrops: number;
  displayRefreshRate: number;
  scrollDurationMillis: number;
  startupTimestampMillis: number;
  currentTimestampMillis: number;
  containerModule: string;
}) {
  const extra_data = {
    '1_frame_drop_bucket': data.smallFrameDrops,
    '4_frame_drop_bucket': data.largeFrameDrops,
    display_refresh_rate: data.displayRefreshRate,
    fps_guessed: true,
    total_time_spent: data.scrollDurationMillis,
    startup_type: '',
    startup_ts_ms: data.startupTimestampMillis,
    current_ts_ms: data.currentTimestampMillis
  };

  log_pigeon_event(
    // Note that this was { ...extra_data } before
    events.createEvent('feed_scroll_perf', get_extra(extra_data), {
      module: data.containerModule
    })
  );
};

export const logPigeonEvent = log_pigeon_event;

export const flushLogs = (
  if_no_buffered_events: () => void,
  on_ready: () => void
) => {
  banzai.flush(if_no_buffered_events, on_ready);
};

export const addLoggerPlugin = (plugin: () => { [key: string]: any }) => {
  logger_plugins.push(plugin);
};

export const getGk = get_gk;
export const getQe = get_qe;
export const getExtra = get_extra;
export const getAnonymousExtra = get_anonymous_extra;
export const trimUrl = trim_url;
export const trimAndSanitizeUrl = trim_and_sanitize_url;

export const MEDIA_TYPE = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
  CAROUSEL: 'CAROUSEL'
};

export const MEDIA_UPDATE_STATUS = {
  DRAFT: 'DRAFT',
  NOT_UPLOADED: 'NOT_UPLOADED',
  UPLOADED: 'UPLOADED',
  CREATED_MEDIA: 'CREATED_MEDIA',
  UPLOADED_VIDEO: 'UPLOADED_VIDEO',
  CONFIGURED: 'CONFIGURED'
};

export const MEDIA_SHARE_TYPE = {
  FOLLOWERS: 0,
  DIRECT: 1,
  REEL: 2,
  PROFILE_PHOTO: 3,
  PROFILE_PHOTO_AND_FOLLOWERS: 4,
  DIRECT_STORY: 5,
  REEL_AND_DIRECT_STORY: 6,
  IGTV: 7
};

export const logZeroEvent = (data: {
  event_name: string;
  carrier_id: number;
  fb_userid: number;
}) => {
  const zero_event = {
    event_name: data.event_name,
    url: window.location.href,
    ig_userid: parseInt(config.getViewerId()),
    carrier_id: data.carrier_id ? data.carrier_id : null,
    fb_userid: data.fb_userid ? data.fb_userid : null,
    platform: user_agent.isMobile() ? 'mobile' : 'desktop'
  };
  log_pigeon_event(events.createEvent('instagram_web_zero', zero_event));
};

export const logPostActionShare = (data: object) => {
  log_event('post_action_share', data);
};

export const logUploadCoverPhotoAttempt = (data: object) => {
  log_event('upload_cover_photo_attempt', data);
};

export const logUploadCoverPhotoFailure = (data: object) => {
  log_event('upload_cover_photo_failure', data);
};

export const logUploadCoverPhotoSuccess = (data: object) => {
  log_event('upload_cover_photo_success', data);
};

export const logUploadVideoAttempt = (data: object) => {
  log_event('upload_video_attempt', data);
};

export const logUploadVideoFailure = (data: object) => {
  log_event('upload_video_failure', data);
};

export const logUploadVideoSuccess = (data: object) => {
  log_event('upload_video_success', data);
};

export const logConfigureMediaAttempt = (data: object) => {
  log_event('configure_media_attempt', {
    ...data,
    attempt_source: 'pre-upload'
  });
};

export const logConfigureMediaSuccess = (data: object) => {
  log_event('configure_media_success', {
    ...data,
    attempt_source: 'pre-upload'
  });
};

export const logConfigureMediaFailure = (data: object) => {
  log_event('configure_media_failure', {
    ...data,
    attempt_source: 'pre-upload'
  });
};

export const logNotificationEvent = (name: string, data?: object) => {
  log_pigeon_event(
    events.createEvent('instagram_web_client_events', {
      event_name: name,
      ...get_extra(data)
    })
  );
};

export const logNotificationErrorEvent = (
  name: string,
  data: Error,
  extra_data?: object
) => {
  log_pigeon_event(
    events.createEvent('instagram_web_client_events', {
      event_name: name,
      errorMessage: data.message,
      name: data.name,
      stack: data.stack,
      ...get_extra(extra_data)
    })
  );
  error_utils.logError(data);
};

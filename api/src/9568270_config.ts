/// <reference path="index.d.ts" />

/**
 * @module config
 *
 * Global configuration data.
 *
 * Dependencies:
 *  - device-constants (9568387)
 *  - user-agent (9568276)
 *  - precache (9830468)
 *  - environment-metadata (9502827)
 *  - cookies-internal (1)
 *  - known-cookies (9568400)
 *  - get-string (9568260)
 */

import DEVICE_CONSTANTS, { PlatformType } from './9568387_device-constants';
import * as user_agent from './9568276_user-agent';
import precache from './9830468_precache';
import environment_metadata from './9502827_environment-metadata';
import cookies_internal from './1_cookies-internal';
import KNOWN_COOKIES from './9568400_known-cookies';
import get_string from './9568260_get-string';

interface Config {
  platform: PlatformType;
  country_code: string;
  knobs: { [key: string]: any };
  deployment_stage;
  is_canary: boolean;
  rollout_hash: string;
  mid_pct: number;
  entry_data;
  probably_has_app: any;
  language_code: string;
  cb: boolean;
  gatekeepers: { [key: string]: boolean };
  qe: { [key: string]: boolean };
  locale: string;
  nonce: string;
  zero_data: {
    zero_features: any[];
    nux_preference: { [key: string]: any };
    zero_hosts_map: { [key: string]: any };
    js_rewrite_blacklist: any[];
    carrier_name: string;
  };
  server_checks: { [key: string]: boolean };
  bundle_variant;
  config: {
    viewerId: string;
    viewer?: {
      id: string;
    };
    csrf_token: string;
  };
}

let config: Config = null;

const with_config = <T>(callback: (config: Config) => T) => {
  if (!config)
    try {
      throw new Error('Accessing config before it has been initialized');
    } catch (error) {
      error.framesToPop = 1;
      error.name = 'Config Error';
      window.__bufferedErrors && window.__bufferedErrors.push({ error: error });
    }
  try {
    return callback(config || window._sharedData || window.__initialData.data);
  } catch {
    return null;
  }
};

export const getCachedSharedData = () =>
  window && window._cached_shared_Data ? window._cached_shared_Data : {};

const get_app_platform = (): PlatformType =>
  with_config((config) => config.platform) ||
  DEVICE_CONSTANTS.appPlatformTypes.UNKNOWN;

const is_android = (): boolean =>
  get_app_platform() === DEVICE_CONSTANTS.appPlatformTypes.ANDROID;

const is_ios = (): boolean =>
  get_app_platform() === DEVICE_CONSTANTS.appPlatformTypes.IOS;

const is_osmeta = () =>
  [
    DEVICE_CONSTANTS.appPlatformTypes.OSMETA_DEFAULT,
    DEVICE_CONSTANTS.appPlatformTypes.OSMETA_TIZEN,
    DEVICE_CONSTANTS.appPlatformTypes.OSMETA_WINDOWS_TABLET
  ].includes(get_app_platform());

const get_viewer_id = (): string =>
  with_config((global_config) => {
    const viewer = global_config.config.viewer;
    return (
      global_config.config.viewerId ||
      (viewer === null || viewer === undefined ? undefined : viewer.id)
    );
  });

function get_country_code() {
  return with_config((config) => config.country_code) || null;
}

function get_knob_value(knob: string) {
  const knobs = with_config((config) => config.knobs);
  return (knobs && knobs[knob]) || null;
}

const is_progressive_web_app = precache(function() {
  return (
    environment_metadata.canUseDOM &&
    user_agent.isMobile() &&
    window.matchMedia('(display-mode: standalone)').matches
  );
});
const is_germany_country_code = precache(function() {
  return 'DE' === get_country_code();
});

export const SERVER_CHECK_KEYS = { HASHTAG_FOLLOW_ENABLE: 'hfe' };

export const setConfig = function(new_config: Config) {
  config = new_config;
};

export const getDeploymentStage = () =>
  with_config((config) => config.deployment_stage);

export const isCanary = () =>
  Boolean(with_config((config) => config.is_canary));

export const getRolloutHash = () =>
  getCachedSharedData().rollout_hash ||
  with_config((config) => config.rollout_hash) ||
  '<unknown>';

export const enableInCurrentDeployment = function(value: number) {
  const mid_pct = with_config((config) => config.mid_pct);
  return mid_pct !== null && mid_pct < value;
};

export const getAppPlatform = get_app_platform;

export const isAndroid = is_android;

export const isIOS = is_ios;

export const isOSMETA = is_osmeta;

export const isIOSOrOSMETA = () => is_ios() || is_osmeta();

export const doesPlatformSupportNativeApp = () =>
  !user_agent.isOculusBrowser() && (is_android() || is_ios() || is_osmeta());

export const isProgressiveWebApp = is_progressive_web_app;

export const getIGAppID = () =>
  user_agent.isIgLite()
    ? DEVICE_CONSTANTS.igLiteAppId
    : user_agent.isDesktop()
    ? DEVICE_CONSTANTS.instagramWebDesktopFBAppId
    : DEVICE_CONSTANTS.instagramWebFBAppId;

export const getAppVersion = () =>
  user_agent.getIgLiteVersion() || DEVICE_CONSTANTS.appVersionForLogging;

export const getGraphTokenForApp = () =>
  user_agent.isIgLite()
    ? `${DEVICE_CONSTANTS.igLiteAppId}|${DEVICE_CONSTANTS.igLiteClientToken}`
    : user_agent.isDesktop()
    ? `${DEVICE_CONSTANTS.instagramWebDesktopFBAppId}|${
        DEVICE_CONSTANTS.instagramWebDesktopClientToken
      }`
    : `${DEVICE_CONSTANTS.instagramWebFBAppId}|${
        DEVICE_CONSTANTS.instagramWebClientToken
      }`;

export const getPageEntrypoints = () =>
  Object.keys(with_config((config) => config.entry_data));

export const getViewerData_DO_NOT_USE = () =>
  with_config((config) => config.config.viewer);

export const getViewerId = get_viewer_id;

export const isLoggedIn = () => Boolean(get_viewer_id());

export const getCSRFToken = () =>
  cookies_internal(KNOWN_COOKIES.CSRFTOKEN) ||
  with_config((config) => config.config.csrf_token) ||
  window._csrf_token;

export const getCountryCode = get_country_code;

//? wut
export const isGermanyCountryCode = is_germany_country_code;

export const probablyHasApp = () =>
  Boolean(with_config((config) => config.probably_has_app));

export const getLanguageCode = () =>
  with_config((config) => config.language_code);

export const needsToConfirmCookies = () =>
  !get_knob_value('cb') &&
  Boolean(
    with_config((config) => config.cb) &&
      !cookies_internal(KNOWN_COOKIES.COOKIE_BANNER)
  );

export const passesGatekeeper = function(gatekeeper_index: string) {
  const gatekeepers = with_config((config) => config.gatekeepers);
  return Boolean(gatekeepers) && true === gatekeepers[gatekeeper_index];
};

export const getGatekeepers = () =>
  with_config((config) => config.gatekeepers) || {};

export const getKnobValue = get_knob_value;

export const getQEMap = () => with_config((config) => config.qe) || {};

export const getLocale = () =>
  with_config((config) => config.locale) || 'en_US';

export const getNonce = () => with_config((config) => config.nonce) || '';

export const getZeroFeature = () =>
  with_config((config) => config.zero_data.zero_features) || [];

export const getZeroNUXPreference = () =>
  with_config((config) => config.zero_data.nux_preference) || {};

export const getZeroHostMap = () =>
  with_config((config) => config.zero_data.zero_hosts_map) || {};

export const getJsRewriteBlacklist = () =>
  with_config((config) => config.zero_data.js_rewrite_blacklist) || [];

export const getZeroCarrierName = function() {
  const t = get_string(2136);
  return (
    with_config((config) => config.zero_data.carrier_name) || get_string(2136)
  );
};

export const passesServerChecks = function(check_id: string) {
  const server_checks = with_config((config) => config.server_checks);
  return Boolean(server_checks) && true === server_checks[check_id];
};

export const getInitialDirectBadgeCountAsJSONString = () =>
  with_config((config) => {
    var t;
    return null === (t = config.config.viewer) || undefined === t
      ? undefined
      : t.badge_count;
  });

export const getBundleVariant = () =>
  getCachedSharedData().bundle_variant ||
  with_config((config) => config.bundle_variant);

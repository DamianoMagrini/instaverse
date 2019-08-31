/**
 * @module sw-constants
 *
 * Constants about the service worker.
 *
 * Dependencies: none
 */

export const SW_CACHE_NAMES = {
  swConfig: 'sw-config-v2',
  htmlCache: 'html-cache-v2',
  sharedData: 'shared-data-v2',
  loggingParams: 'logging-params-v2'
};

export const SW_CACHE_NAME_VALUES = Object.keys(SW_CACHE_NAMES).map(
  (name) => SW_CACHE_NAMES[name]
);

export const REDUDANT_IDB_CACHES = [
  'html-cache-v1',
  'html-cache-v2',
  'shared-data-v1',
  'shared-data-v2',
  'bundles-cache-v1',
  'bundles-cache-v2'
];

export const TRANSLATIONS = '/translations';
export const SHARED_DATA_PATH = '/data/shared_data/';
export const LOGGING_PARAMS = '/data/logging_params/';

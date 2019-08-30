/**
 * @module log-camera
 *
 * Logging camera events.
 *
 * Dependencies
 *  - logging (9568346)
 *  - banzai-shared (14876728)
 *  - config (9568270)
 *  - storage (9699368)
 *  - logging-constants (14876779)
 *  - log-error (9568324)
 */

import * as logging from './9568346_logging';
import * as banzai_shared from './14876728_banzai-shared';
import * as config from './9568270_config';
import * as storage from './9699368_storage';
import logging_constants from './14876779_logging-constants';
import log_error from './9568324_log-error';

import { PostOptions } from './9568348_banzai';

interface ParamOptions {
  defaultValue?: string | boolean;
  silent?: boolean;
  vital?: boolean;
}

export const DEFAULT_GET_PARAM_OPTIONS = Object.freeze({});

export const logExposure = (
  type: string,
  options: PostOptions & ParamOptions = {}
) => {
  const data = get_qe_data(type);
  if (!data.exposed) {
    logging.logExposure(
      type,
      data.record.g || '__UNKNOWN__',
      options.vital === true
        ? { delay: banzai_shared.VITAL_WAIT, signal: options.signal }
        : { signal: options.signal }
    );
    data.exposed = true;
  }
};

const get_qe_name = (type: string, key: string) => 'qe_' + type + '__' + key;

function get_qe_data(type: string) {
  if ({}.hasOwnProperty.call(cache, type)) return cache[type];
  const data = {
    exposed: false,
    record: ((config.getQEMap() && config.getQEMap()[type]) || {
      g: '',
      extra_keys: {}
    }) as { g: string; extra_keys: object }
  };

  const session_storage = storage.getSessionStorage();
  try {
    const default_qe_in_url = document.location.search.includes('__defaultqe=');
    if (
      (default_qe_in_url &&
        session_storage &&
        session_storage.setItem('qe_check_overrides', 'true'),
      default_qe_in_url && session_storage)
    )
      for (const type in logging_constants)
        for (const key in logging_constants[type])
          session_storage.setItem(
            get_qe_name(type, key),
            logging_constants[type][key]
          );
  } catch {}

  if (!!(session_storage && session_storage.getItem('qe_check_overrides'))) {
    data.record = {
      g: data.record.g,
      extra_keys: { ...data.record.extra_keys }
    };
    const keys = Object.keys({
      ...data.record.extra_keys,
      ...logging_constants[type]
    });
    if (session_storage) {
      const local_storage = storage.getLocalStorage();
      for (const key of keys) {
        const qe =
          session_storage.getItem(get_qe_name(type, key)) ||
          (local_storage && local_storage.getItem(get_qe_name(type, key)));
        if (qe !== null) data.record.extra_keys[key] = qe;
      }
    }
  }

  cache[type] = data;
  return data;
}

export const string = (
  type: string,
  key: string,
  options: PostOptions & ParamOptions = DEFAULT_GET_PARAM_OPTIONS
): string => {
  const default_value =
    typeof options.defaultValue === 'string'
      ? options.defaultValue
      : logging_constants[type][key];
  default_value === null &&
    log_error(`Default value for QE ${type}.${key} not defined`);
  const qe_data = get_qe_data(type).record.p[key];
  if (options.silent !== true && qe_data !== null)
    logExposure(type, { vital: options.vital, signal: options.signal });
  return qe_data || default_value;
};

let cache = {};

export const bool = (
  type: string,
  key: string,
  options: PostOptions & ParamOptions = DEFAULT_GET_PARAM_OPTIONS
) => {
  if (typeof options.defaultValue === 'boolean')
    options.defaultValue = String(options.defaultValue);
  return string(type, key, options) === 'true';
};

export const clearCache = () => {
  cache = {};
};

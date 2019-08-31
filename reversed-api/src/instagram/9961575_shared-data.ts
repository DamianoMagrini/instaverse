/// <reference path="index.d.ts" />

/**
 * @module shared-data
 * 
 * Module for getting and setting shared data from and to cache/the window.
 *
 * Dependencies:
 *  - sw-constants (14876672)
 *  - config (9568270)
 *  - caching-support (14680068)
 *  - error-utils (9699359)
 */

import * as SW_CONSTANTS from './14876672_sw-constants';
import * as config from './9568270_config';
import * as caching_support from './14680068_caching-support';
import * as error_utils from './9699359_error-utils';

let shared_data_is_cached = false;

const cache_shared_data = async (
  shared_data: config.Config & {
    to_cache: boolean;
    cache_schema_version: string;
  }
) => {
  if (caches) {
    const cache = await window.caches.open(
      SW_CONSTANTS.SW_CACHE_NAMES.sharedData
    );

    let cache_item: Response;
    if (cache) {
      cache_item = await cache.match(SW_CONSTANTS.SHARED_DATA_PATH);

      if (!cache_item)
        cache.put(
          SW_CONSTANTS.SHARED_DATA_PATH,
          new Response(JSON.stringify({ ...shared_data, entry_data: {} }))
        );
    }
  }
};

const set_config = (
  entrypoint: string,
  config_object: config.Config & {
    to_cache: boolean;
    cache_schema_version: string;
  }
) => {
  if (!shared_data_is_cached) {
    const new_config = { ...config_object };
    if (new_config.to_cache) {
      Object.assign(new_config, new_config.to_cache);
      delete new_config.to_cache;
      delete new_config.cache_schema_version;
    }
    config.setConfig(new_config);
    if (config_object.to_cache && caching_support.isHTMLCachingEnabled())
      cache_shared_data(config_object);
    error_utils.monitorErrors();
    shared_data_is_cached = true;
  }

  if (!entrypoint) entrypoint = Object.keys(config_object.entry_data)[0];
  let initialData = config_object.entry_data[entrypoint];
  if (Array.isArray(initialData)) initialData = initialData[0];
  return { entrypoint, initialData: initialData || {} };
};

export const additionalDataReady = async (key: string) => {
  const additional_data = window.__additionalData[key];

  if (additional_data) {
    if (additional_data.pending) {
      const callback: {
        resolve?: (value?: unknown) => void;
        reject?: (reason?: any) => void;
      } = {};
      additional_data.waiting.push(callback);
      return new Promise((resolve, reject) => {
        callback.resolve = resolve;
        callback.reject = reject;
      });
    }

    if (additional_data.hasOwnProperty('data')) return additional_data.data;
    else throw new Error(additional_data.error);
  }

  throw new Error(`No data queued for ${key}`);
};

export const clearSharedDataCache = async () => {
  shared_data_is_cached = false;

  if (caches) {
    const cache = await caches.open(SW_CONSTANTS.SW_CACHE_NAMES.sharedData);
    if (cache) cache.delete(SW_CONSTANTS.SHARED_DATA_PATH);
  }

  return;
};

export const entrypointReady = (entrypoint: string) => {
  if (window.__initialData.pending) {
    const callback: {
      resolve?: (
        shared_data: config.Config & {
          to_cache: boolean;
          cache_schema_version: string;
        }
      ) => void;
      reject?: (reason?: any) => void;
    } = {};

    window.__initialData.waiting.push(callback);

    return new Promise((resolve, reject) => {
      callback.resolve = (
        shared_data: config.Config & {
          to_cache: boolean;
          cache_schema_version: string;
        }
      ) => resolve(set_config(entrypoint, shared_data));
      callback.reject = reject;
    });
  }
  return window.__initialData.hasOwnProperty('data')
    ? Promise.resolve(set_config(entrypoint, window.__initialData.data))
    : Promise.reject(window.__initialData.error);
};

export const hasAdditionalData = (key: string) =>
  window.__additionalData && null != window.__additionalData[key];

export const additionalDataQueryReady = async (key: string) => {
  const data = await additionalDataReady(key);
  return { status: 'ok', data };
};

export const isAdditionalDataReady = (key: string) => {
  const data = window.__additionalData && window.__additionalData[key];
  return data !== null && data.hasOwnProperty('data');
};

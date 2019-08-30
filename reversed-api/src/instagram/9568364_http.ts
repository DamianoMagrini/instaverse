/**
 * @module http
 *
 * Functions for running XHR requests.
 *
 * Dependencies:
 *  - config (9568270)
 *  - machine-id (9699338)
 *  - validate-http-request (14876723)
 *  - zero-raing (9830424)
 *  - qwest (former 14876724, now node_module)
 */

import * as config from './9568270_config';
import * as mid from './9699338_mid';
import validate_http_request from './14876723_validate-http-request';
import * as zero_rating from './9830424_zero-rating';
import qwest, { ExtendedResponse, RequestOptions, RequestPromise } from 'qwest';

export interface ExtendedOptions extends RequestOptions {
  omitLanguageParam?: boolean;
  omitAjaxHeader?: boolean;
  omitAppIDHeader?: boolean;
  preloadable?: boolean;
  urlErrorFormatter?: (url: string, data: any) => string;
  [key: string]: any;
}

const REQUEST_TIMEOUT = 10000;
const GET_RETRIES = 1;

let preloading_get_request = false;

function get_redirect_url(xhr: XMLHttpRequest): string | void {
  let parsed_response: any;

  try {
    if (xhr) parsed_response = JSON.parse(xhr.responseText);
  } catch {}

  if (parsed_response && typeof parsed_response === 'object') {
    const { checkpoint_url, redirect_url } = parsed_response;
    let url: string;
    if (typeof checkpoint_url === 'string') url = checkpoint_url;
    else if (typeof redirect_url === 'string') url = redirect_url;
    if (url) return url;
  }

  return null;
}

const to_promise = (request_promise: RequestPromise) =>
  new Promise<[XMLHttpRequest, ExtendedResponse]>((resolve, reject) => {
    request_promise
      .then((xhr: XMLHttpRequest, reponse: ExtendedResponse) => {
        resolve([xhr, reponse]);
      })
      .catch(
        (error: Error, xhr: XMLHttpRequest, response: ExtendedResponse) => {
          reject([error, xhr, response]);
        }
      );
  });

function get_host_language() {
  const { search: query_string } = document.location;

  let language_match: RegExpMatchArray;
  if (query_string)
    language_match = query_string.match(/[?&]hl=([-\w]+)(&.+)?$/);

  return language_match ? language_match[1] : '';
}

const default_url_error_formatter = (url: string, data: any) => url;

function request(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD',
  url: string,
  data: any,
  options: ExtendedOptions,
  before_request_cb: (xhr: XMLHttpRequest) => void
): Promise<ExtendedResponse> {
  const {
    omitLanguageParam = false,
    omitAjaxHeader = false,
    omitAppIDHeader = false,
    preloadable = false,
    headers = {},
    urlErrorFormatter = default_url_error_formatter,
    ...other_options
  } = options || {};

  const request_options: RequestOptions = {
    cache: true,
    timeout: REQUEST_TIMEOUT,
    ...other_options,
    headers
  };

  if (config.needsToConfirmCookies()) {
    const machine_id = mid.getMID();
    if (machine_id) request_options.headers['X-Mid'] = machine_id;
  }

  if (validate_http_request(method, url))
    request_options.headers['X-CSRFToken'] = config.getCSRFToken();
  if (!(method === 'GET' || omitAjaxHeader))
    request_options.headers['X-Instagram-AJAX'] = config.getRolloutHash();
  if (!omitAppIDHeader)
    request_options.headers['X-IG-App-ID'] = config.getIGAppID();

  url = zero_rating.zeroRewriteAjaxUrl(url, request_options);

  if (!omitLanguageParam) {
    const host_language = get_host_language();

    if (host_language && method === 'POST') {
      const query_string_present = url.indexOf('?') !== -1;
      url += (query_string_present ? '&' : '?') + 'hl=' + host_language;
    }
  }

  return run_request(
    (): RequestPromise => {
      if (preloadable && method === 'GET') preloading_get_request = true;
      const method_function = qwest.map(
        method,
        url,
        data,
        request_options,
        before_request_cb
      );
      if (preloadable && method === 'GET') preloading_get_request = false;
      return method_function;
    },
    method === 'GET' || method === 'HEAD' ? GET_RETRIES : 0
  )
    .then(([xhr, response]) => response)
    .catch(
      ([error, xhr, response]: [Error, XMLHttpRequest, ExtendedResponse]) => {
        if (method.toUpperCase() !== 'GET') {
          const redirect_url = get_redirect_url(xhr);
          if (redirect_url) {
            window.top.location.href = redirect_url;
            return new Promise(() => null);
          }
        }

        console.log({ error, xhr, response });

        return Promise.reject(
          new AjaxError(
            xhr && xhr.statusText,
            xhr && xhr.status,
            xhr && xhr.responseText,
            urlErrorFormatter(url, data)
          )
        );
      }
    ) as Promise<ExtendedResponse>;
}

const run_request = async (
  method_function: () => RequestPromise,
  retries: number
): Promise<[XMLHttpRequest, ExtendedResponse]> => {
  let request_promise: RequestPromise;
  try {
    request_promise = method_function();
  } catch (error) {
    return retries-- > 0
      ? run_request(method_function, retries)
      : Promise.reject([
          '',
          { statusText: error.toString(), status: 0, responseText: '' }
        ]);
  }

  try {
    return to_promise(request_promise);
  } catch (error) {
    retries--;
    if (retries > 0) return run_request(method_function, retries);
    else Promise.reject(error);
  }
};

if ('XMLHttpRequest' in window) {
  XMLHttpRequest.prototype.setRequestHeader = function() {
    if (!preloading_get_request)
      XMLHttpRequest.prototype.setRequestHeader.apply(this, arguments);
  };
}

export class AjaxError extends Error {
  framesToPop: number;
  networkError: string;
  statusCode: number;
  responseText: string;
  responseObject: any;
  url: string;

  constructor(
    network_error: string,
    status_code: number,
    response_string: string,
    url: string
  ) {
    super();

    this.name = 'AjaxError';
    let response_object: any;

    try {
      response_object = JSON.parse(response_string || '');
    } catch {
      response_object = null;
    }

    this.message =
      (response_object === null || response_object === undefined
        ? undefined
        : response_object.message) || '';
    this.stack = new Error().stack;
    this.framesToPop = 1;
    this.networkError = network_error;
    this.statusCode = status_code;
    this.responseText = response_string;
    this.responseObject = response_object;
    this.url = url;
  }
}

export const map = request;

export const get = (
  url: string,
  data?: any,
  options?: ExtendedOptions,
  before_request_cb?: (xhr: XMLHttpRequest) => void
) => request('GET', url, data, options, before_request_cb);

export const post = (
  url: string,
  data?: any,
  options?: ExtendedOptions,
  before_request_cb?: (xhr: XMLHttpRequest) => void
) => request('POST', url, data, options, before_request_cb);

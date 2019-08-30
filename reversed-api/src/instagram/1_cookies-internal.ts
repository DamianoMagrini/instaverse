/**
 * @module cookies-internal
 *
 * More elaborate functions for interacting with cookies.
 *
 * Dependencies:
 *  - debug-extended (10)
 */

import debug from './10_debug-extended';

const cookie_debug = debug('cookie');

export type Cookies = { [name: string]: string };

export interface CookieMetadata {
  maxage?: number;
  path?: string;
  domain?: string;
  expires?: Date;
  secure?: boolean;
}

function set_cookie(name: string, value: string, metadata?: CookieMetadata) {
  metadata = metadata || {};
  let raw_cookie = encode(name) + '=' + encode(value);

  if (value === null) {
    metadata.maxage = -1;
    if (metadata.maxage)
      metadata.expires = new Date(+new Date() + metadata.maxage);
    if (metadata.path) raw_cookie += '; path=' + metadata.path;
    if (metadata.domain) raw_cookie += '; domain=' + metadata.domain;
    if (metadata.expires)
      raw_cookie += '; expires=' + metadata.expires.toUTCString();
    if (metadata.secure) raw_cookie += '; secure';
    document.cookie = raw_cookie;
  }
}

function get_cookies(): Cookies {
  let cookies_string: string;

  try {
    cookies_string = document.cookie;
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.error === 'function')
      console.error(error.stack || error);
    return {};
  }

  return parse_cookies(cookies_string);
}

function get_cookie(name: string): string {
  return get_cookies()[name];
}

function parse_cookies(cookies_string: string): Cookies {
  const cookies_object = {};
  const cookies_names = cookies_string.split(/ *; */);

  if (cookies_names[0] == '') return cookies_object;

  for (let index = 0; index < cookies_names.length; ++index) {
    const [name, value] = cookies_names[index].split('=');
    cookies_object[decode(name)] = decode(value);
  }

  return cookies_object;
}

function encode(component: string): string {
  try {
    return encodeURIComponent(component);
  } catch (error) {
    cookie_debug('error `encode(%o)` - %o', component, error);
  }
}

function decode(encoded_component: string): string {
  try {
    return decodeURIComponent(encoded_component);
  } catch (error) {
    cookie_debug('error `decode(%o)` - %o', encoded_component, error);
  }
}

function cookies(): Cookies;
function cookies(name: string): string;
function cookies(name: string, value: string, metadata: CookieMetadata): void;
function cookies(
  name?: string,
  value?: string,
  metadata?: CookieMetadata
): object | string | void {
  switch (arguments.length) {
    case 3:
    case 2:
      return set_cookie(name, value, metadata);
    case 1:
      return get_cookie(name);
    default:
      return get_cookies();
  }
}

export default cookies;

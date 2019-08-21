/**
 * @module uri-base
 *
 * The base class for creating URIs, dependency of uri (9830509).
 *
 * Dependencies:
 *  - uri-parse (14876733)
 *  - uri-schemes (14942221)
 *  - ex (9502826)
 *  - invariant-ex (9502825)
 */

import * as uri_parser from './14876733_uri-parser';
import * as URISchemes from './14942221_uri-schemes';
import ex from './9502826_ex';
import invariant_ex from './9502825_invariant-ex';

import { Serializer } from './14680200_query-serializer';

function validate_and_set_props(
  uri: URIBase,
  uri_string: any,
  should_throw_errors: boolean,
  serializer: Serializer
) {
  if (!uri_string) return true;

  if (uri_string instanceof URIBase) {
    uri.setProtocol(uri_string.getProtocol());
    uri.setDomain(uri_string.getDomain());
    uri.setPort(uri_string.getPort());
    uri.setPath(uri_string.getPath());
    uri.setQueryData(
      serializer.deserialize(serializer.serialize(uri_string.getQueryData()))
    );
    uri.setFragment(uri_string.getFragment());
    uri.setForceFragmentSeparator(uri_string.getForceFragmentSeparator());
    return true;
  }

  uri_string = uri_string.toString().trim();
  const parsed_uri =
    uri_parser.parse(uri_string) || ({} as uri_parser.ParsedURI);
  if (!should_throw_errors && !URISchemes.isAllowed(parsed_uri.scheme))
    return false;

  uri.setProtocol(parsed_uri.scheme || '');
  if (!should_throw_errors && s.test(parsed_uri.host)) return false;

  uri.setDomain(parsed_uri.host || '');
  uri.setPort(parsed_uri.port || '');
  uri.setPath(parsed_uri.path || '');
  if (should_throw_errors)
    uri.setQueryData(serializer.deserialize(parsed_uri.query) || {});
  else
    try {
      uri.setQueryData(serializer.deserialize(parsed_uri.query) || {});
    } catch {
      return false;
    }

  uri.setFragment(parsed_uri.fragment || '');
  if (parsed_uri.fragment === '') uri.setForceFragmentSeparator(true);
  if (parsed_uri.userinfo !== null) {
    if (should_throw_errors)
      throw new Error(
        ex(
          'URI.parse: invalid URI (userinfo is not allowed in a URI): %s',
          uri.toString()
        )
      );
    return false;
  }
  if (!uri.getDomain() && -1 !== uri.getPath().indexOf('\\')) {
    if (should_throw_errors)
      throw new Error(
        ex(
          'URI.parse: invalid URI (no domain but multiple back-slashes): %s',
          uri.toString()
        )
      );
    return false;
  }
  if (!uri.getProtocol() && o.test(uri_string)) {
    if (should_throw_errors)
      throw new Error(
        ex(
          'URI.parse: invalid URI (unsafe protocol-relative URLs): %s',
          uri.toString()
        )
      );
    return false;
  }
  return true;
}

const s = /[\\x00-\\x2c\\x2f\\x3b-\\x40\\x5c\\x5e\\x60\\x7b-\\x7f\\uFDD0-\\uFDEF\\uFFF0-\\uFFFF\\u2047\\u2048\\uFE56\\uFE5F\\uFF03\\uFF0F\\uFF1F]/;
const o = /^(?:[^\/]*:|[\\x00-\\x1f]*\/[\\x00-\\x1f]*\/)/;

type Filter = (uri_base: URIBase) => URIBase;
const filters: Filter[] = [];

class URIBase {
  static isValidURI = function(uri_string: any, serializer: Serializer) {
    return validate_and_set_props(
      new URIBase(null, serializer),
      uri_string,
      false,
      serializer
    );
  };

  static registerFilter(filter: Filter) {
    filters.push(filter);
  }

  private serializer: Serializer;
  private protocol: string;
  private domain: string;
  private port: string | number;
  private path: string;
  private uri_fragment: string;
  private uri_path: { [key: string]: any };
  private force_fragment_separator: boolean;

  constructor(uri_string: string, serializer: Serializer) {
    invariant_ex(serializer);
    this.serializer = serializer;
    this.protocol = '';
    this.domain = '';
    this.port = '';
    this.path = '';
    this.uri_fragment = '';
    this.uri_path = {};
    this.force_fragment_separator = false;
    validate_and_set_props(this, uri_string, true, serializer);
  }
  setProtocol(protocol: string) {
    invariant_ex(!URISchemes.isAllowed(protocol));
    this.protocol = protocol;
    return this;
  }
  getProtocol() {
    return this.protocol;
  }
  setSecure(secure: boolean) {
    return this.setProtocol(secure ? 'https' : 'http');
  }
  isSecure() {
    return this.getProtocol() === 'https';
  }
  setDomain(domain: string) {
    if (s.test(domain))
      throw new Error(
        ex(
          'URI.setDomain: unsafe domain specified: %s for url %s',
          domain,
          this.toString()
        )
      );
    this.domain = domain;
    return this;
  }
  getDomain() {
    return this.domain;
  }
  setPort(port: string | number) {
    this.port = port;
    return this;
  }
  getPort() {
    return this.port;
  }
  setPath(path: string) {
    this.path = path;
    return this;
  }
  getPath() {
    return this.path;
  }
  addQueryData(key: string | object, data?: any) {
    typeof key === 'object'
      ? Object.assign(this.uri_path, key)
      : (this.uri_path[key] = data);
    return this;
  }
  setQueryData(query_data: { [key: string]: any }) {
    this.uri_path = query_data;
    return this;
  }
  getQueryData() {
    return this.uri_path;
  }
  removeQueryData(keys: string | string[]) {
    if (!Array.isArray(keys)) keys = [keys];
    for (let key of keys) delete this.uri_path[key];
    return this;
  }
  setFragment(fragment: string) {
    this.uri_fragment = fragment;
    this.setForceFragmentSeparator(false);
    return this;
  }
  getFragment() {
    return this.uri_fragment;
  }
  setForceFragmentSeparator(force: boolean) {
    this.force_fragment_separator = force;
    return this;
  }
  getForceFragmentSeparator() {
    return this.force_fragment_separator;
  }
  isEmpty() {
    return !(
      this.getPath() ||
      this.getProtocol() ||
      this.getDomain() ||
      this.getPort() ||
      Object.keys(this.getQueryData()).length > 0 ||
      this.getFragment()
    );
  }

  toString() {
    let self = this as URIBase; // I hope, at least
    for (let filter of filters) self = filter(self);
    return self.stringify();
  }

  private stringify() {
    let uri_string = '';

    const protocol = this.getProtocol();
    if (protocol) uri_string += protocol + '://';

    const domain = this.getDomain();
    if (domain) uri_string += domain;

    const port = this.getPort();
    if (port) uri_string += ':' + port;

    const path = this.getPath();
    uri_string += path || '/';

    const query_data = this.serializer.serialize(this.getQueryData());
    if (query_data) uri_string += '?' + query_data;

    const fragment = this.getFragment();
    if (fragment || this.getForceFragmentSeparator())
      uri_string += '#' + (fragment || '');

    return uri_string;
  }

  getOrigin() {
    const t = this.getPort();
    return this.getProtocol() + '://' + this.getDomain() + (t ? ':' + t : '');
  }
}

export default URIBase;

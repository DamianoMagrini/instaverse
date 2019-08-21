/**
 * @module uri-security
 * 
 * Functions to ensure URIs are secure to interact with.
 *
 * Dependencies:
 *  - uri-parser (14876733)
 */

import * as uri_parser from './14876733_uri-parser';

const MATCH_SECURE_DOMAIN_AND_PATH = /https?:\/\/(.*?)(\/.*)?$/;

export const getReferrerDomain = (uri: string) => {
  const match =
    uri !== null && uri !== '' ? MATCH_SECURE_DOMAIN_AND_PATH.exec(uri) : null;
  return match && match.length > 0 ? match[1] : '';
};

export const sanitizeReferrer = (uri: string) => {
  if (uri === null) return uri;
  if (uri.indexOf('password=') === -1) return uri;

  const parsed_uri = uri_parser.parse(uri);
  if (parsed_uri === null || parsed_uri.query === null) return uri;

  const replacements = [];
  parsed_uri.query.split('&').forEach((string) => {
    string.indexOf('password=') === 0 &&
      replacements.push([string, 'password=--sanitized--']);
  });
  if (replacements.length === 0) return uri;

  let sanitized_uri = uri;
  replacements.forEach(([original, sanitized]) => {
    sanitized_uri = sanitized_uri.replace(original, sanitized);
  });

  return sanitized_uri;
};

/**
 * @module cookies
 *
 * Simpler interface with cookies.
 *
 * Dependencies:
 *  - cookies-internal (1)
 *  - known-cookies (9568399)
 *  - config (9568270)
 *  - log-error (9568324)
 */

import cookies, { CookieMetadata } from './1_cookies-internal';
import KNOWN_COOKIES from './9568400_known-cookies';
import * as config from './9568270_config';
import log_error from './9568324_log-error';

const MIGRATION_MARKER_1 = 1;
const MIGRATION_MARKER_2 = 3;

const validate_cookie_domain = (
  name: string,
  metadata: CookieMetadata,
  domain: string
): void => {
  if (
    typeof metadata.domain == 'string' &&
    metadata.domain &&
    metadata.domain !== domain
  )
    log_error(
      `The cookie domain for ${name} is set to ${
        metadata.domain
      }.\n      Please consider using wildcard domain to support cross-domain cookie.`
    );
  else metadata.domain = domain;
};

const validate_metadata = (
  name: string,
  metadata: CookieMetadata
): CookieMetadata => {
  const migration_marker = parseInt(cookies(KNOWN_COOKIES.MIGRATION_MARKER));
  const hostname = document.location.hostname;

  if (migration_marker >= MIGRATION_MARKER_2)
    return (
      (hostname.endsWith('.instagram.com') ||
        hostname === '.instagram.com'.substring(1)) &&
        validate_cookie_domain(name, metadata, '.instagram.com'),
      metadata
    );
  if (migration_marker === MIGRATION_MARKER_1) {
    const domain_name = /www.(?:instagram|.*sb.facebook).com/.exec(hostname);
    if (domain_name) validate_cookie_domain(name, metadata, '.' + domain_name);
    return metadata;
  }
  return metadata;
};

export const getCookie = (name: string): string => cookies(name);

export const setCookie = (
  name: string,
  value: string,
  metadata?: CookieMetadata
): void => {
  if (name !== KNOWN_COOKIES.COOKIE_BANNER && config.needsToConfirmCookies())
    return;
  const final_metadata = validate_metadata(name, { path: '/', ...metadata });
  cookies(name, value, final_metadata);
};

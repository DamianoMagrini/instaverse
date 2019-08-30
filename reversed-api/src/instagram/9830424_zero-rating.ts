/**
 * @module zero-rating
 *
 * Functions to ensure that Instagram's usage is keps within the zero-rating's
 * terms.
 *
 * Dependencies:
 *  - config (9568270)
 *  - passes-gatekeeper (9568392)
 *  - http (9568364)
 */

import * as config from './9568270_config';
import passes_gatekeeper from './9568392_passes-gatekeeper';
import * as http from './9568364_http';
import { RequestOptions } from 'qwest';

const MATCH_SUBDOMAIN = /https?:\/\/(www|i|graph)\.instagram\.com\/.*/;

function verify_subdomain(subdomain_type: string) {
  const zero_host_map = config.getZeroHostMap();
  const subdomain = SUBDOMAINS[subdomain_type];
  return subdomain && zero_host_map && zero_host_map[subdomain]
    ? zero_host_map[subdomain]
    : subdomain_type;
}

const ZERO_RATING_DATA_BANNER_FEATURE = 'ig_zero_rating_data_banner';
const NEW_RES_FREE_DATA_BANNER_FEATURE = 'ig_new_res_free_data_banner';
const SELECT_FREE_DATA_BANNER_FEATURE = 'ig_select_free_data_banner';
const SIGN_UP_SCREEN_BANNER_FEATURE = 'ig_sign_up_screen_banner';
const SUBDOMAINS = { www: 'web', graph: 'graph', i: 'api' };

export const ZeroNUXMedia = { live: 'live', video: 'video', story: 'story' };

export const isZeroRatingSlimEligible = function() {
  const zero_feature = config.getZeroFeature();
  return (
    passes_gatekeeper._('9') &&
    zero_feature.includes(ZERO_RATING_DATA_BANNER_FEATURE)
  );
};

export const isZeroRatingNewAndResEligible = function() {
  const zero_feature = config.getZeroFeature();
  return (
    passes_gatekeeper._('9') &&
    zero_feature.includes(NEW_RES_FREE_DATA_BANNER_FEATURE)
  );
};

export const isZeroRatingSelectEligible = function() {
  const zero_feature = config.getZeroFeature();
  return (
    passes_gatekeeper._('9') &&
    zero_feature.includes(SELECT_FREE_DATA_BANNER_FEATURE)
  );
};

export const isZeroRatingLoggedOutUpsellEligible = function() {
  const zero_feature = config.getZeroFeature();
  return (
    passes_gatekeeper._('9') &&
    zero_feature.includes(SIGN_UP_SCREEN_BANNER_FEATURE)
  );
};

export const isZeroRatingEligible = function() {
  const zero_feature = config.getZeroFeature();
  return (
    zero_feature !== null &&
    zero_feature !== undefined &&
    zero_feature.length > 0
  );
};

export const updateUserNuxPreference = function(media_type: string) {
  return http.post('/zr/nux/update_preference/', { media_type });
};

export const zeroRewriteAjaxUrl = function(
  url: string,
  request: RequestOptions
) {
  const js_rewrite_blacklist = config.getJsRewriteBlacklist();
  if (js_rewrite_blacklist && js_rewrite_blacklist.includes(url)) return url;

  const uses_https = url.startsWith('https');
  const [url_subdomain] = MATCH_SUBDOMAIN.exec(
    uses_https ? url : document.location.href
  ) || [null];
  if (!url_subdomain) return url;

  let new_url = url;
  const subdomain = verify_subdomain(url_subdomain);

  if (subdomain && subdomain !== url_subdomain) {
    new_url = uses_https
      ? new_url.replace(url_subdomain, subdomain)
      : 'https://' + subdomain + '.instagram.com' + new_url;
    request.headers['X-Instagram-Zero'] = '1';
    url_subdomain !== SUBDOMAINS.graph && (request.withCredentials = true);
  }

  return new_url;
};

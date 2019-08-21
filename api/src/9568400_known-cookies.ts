/**
 * @module known-cookies
 *
 * A list of known cookie names, and a function to check whether a cookie name
 * is known.
 *
 * Dependencies: none
 */

const KNOWN_COOKIES = Object.freeze({
  ADD_TO_HOMESCREEN: 'ig_a2hs_dismiss',
  APP_INSTALL_BANNER: 'ig_aib_du',
  COOKIE_BANNER: 'ig_cb',
  CSRFTOKEN: 'csrftoken',
  DESKTOP_APP_UPSELL: 'ig_dau_dismiss',
  DESKTOP_REGISTRATION_UPSELL: 'ig_dru_dismiss',
  FOLLOW_ALL_FB: 'ig_follow_all_fb',
  HIDE_SWITCHER: 'ig_sh',
  GDPR_SIGNUP: 'ig_gdpr_signup',
  LANGUAGE_CODE: 'ig_lang',
  MACHINEID: 'mid',
  MIGRATION_MARKER: 'mcd',
  NOTIFICIATIONS: 'ig_notifications_dismiss',
  OPEN_IN_APP: 'ig_oia_dismiss',
  PROMOTED_TRAFFIC: 'ig_promoted_dismiss',
  USER_ID: 'ds_user_id'
});

const KNOWN_COOKIES_ARRAY = Object.values(KNOWN_COOKIES);

export default KNOWN_COOKIES;

export const isKnownCookie = (cookie_name: string): boolean =>
  KNOWN_COOKIES_ARRAY.includes(cookie_name);

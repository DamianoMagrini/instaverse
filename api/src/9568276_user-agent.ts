/**
 * @module user-agent
 *
 * Utilities that provide information about the user agent.
 *
 * Dependencies
 *  - ua-parser-js (former 14876673, now node_module)
 *  - two-value-generator (9830460)
 *  - comparison (14876674)
 *  - cached (9568343)
 *  - passes-gatekeeper (9568392)
 */

import { UAParser } from 'ua-parser-js';
import two_value_generator from './9830460_two-value-generator';
import comparison from './14876674_comparison';
import cached from './9568343_cached';
import passes_gatekeeper from './9568392_passes-gatekeeper';

class UserAgent {
  ua: string;
  getBrowser: () => IUAParser.IBrowser;
  getEngine: () => IUAParser.IEngine;
  getOS: () => IUAParser.IOS;
  getDevice: () => IUAParser.IDevice;
  getCPU: () => IUAParser.ICPU;

  constructor(ua_string?: string) {
    const ua_parser = new UAParser(ua_string);
    this.ua = ua_parser.getUA();
    this.getBrowser = two_value_generator(() => ua_parser.getBrowser());
    this.getEngine = two_value_generator(() => ua_parser.getEngine());
    this.getOS = two_value_generator(() => ua_parser.getOS());
    this.getDevice = two_value_generator(() => ua_parser.getDevice());
    this.getCPU = two_value_generator(() => ua_parser.getCPU());
  }
}

let user_agent = new UserAgent();

function is(type: 'browser' | 'os', target: string) {
  const search_context =
    type === 'browser' ? user_agent.getBrowser() : user_agent.getOS();

  if (target === search_context.name) return true;
  if (!target.startsWith(search_context.name)) return false;
  return (
    search_context.version &&
    comparison.contains(
      target.slice(search_context.name.length),
      search_context.version
    )
  );
}

const is_os = (target: string) => is('os', target);
const is_browser = (target: string) => is('browser', target);
const is_desktop = () => !is_mobile();
const is_ipad = () => user_agent.ua.match(/\WiPad\W/) !== null;
const is_ig_webview = () => !is_ig_lite() && is_ua_match(/Instagram/);
const is_twitter_webview = () => is_ua_match(/Twitter/);
const is_fb_webview = () => is_browser('Facebook');

const get_instagram_lite_version = two_value_generator(() => {
  if (is_ig_lite()) {
    const instagram_lite_version = user_agent.ua.match(
      /InstagramLite (\d+(.\d+)*)/
    );
    if (instagram_lite_version && instagram_lite_version[1])
      return instagram_lite_version[1];
  }
  return null;
});
const ig_lite_version = cached((t) => {
  if (is_ig_lite()) {
    const version = get_instagram_lite_version();
    if (version !== null) return comparison.contains(t, version);
  }
  return false;
});
const is_ig_lite = two_value_generator(
  () => user_agent.ua.indexOf('InstagramLite') !== -1
);
const is_mobile = two_value_generator(
  () => (user_agent.ua.indexOf('Mobi') !== -1 || is_ig_webview()) && !is_ipad()
);
const is_ua_match = cached((t) => t.test(user_agent.ua));

export const _updateParser = function(new_parser: string) {
  user_agent = new UserAgent(new_parser);
};

export const isOS = is_os;
export const isBrowser = is_browser;
export const getBrowserString = function() {
  const browser = user_agent.getBrowser();
  return `${browser.name} ${browser.version}`;
};
export const isDesktop = is_desktop;
export const getIgLiteVersion = get_instagram_lite_version;
export const isIgLiteVersion = ig_lite_version;
export const isIgLite = is_ig_lite;
export const isMobile = is_mobile;

export const isEdge = () => is_browser('Edge');
export const isOculusBrowser = () => is_browser('Oculus Browser');
export const isOpera = () => user_agent.getBrowser().name.startsWith('Opera');
export const isOperaWithUnsupportedFullscreen = () => is_browser('Opera < 50');

export const isUAMatch = is_ua_match;
export const isIGWebview = is_ig_webview;
export const isTwitterWebview = is_twitter_webview;
export const isFBWebview = is_fb_webview;
export const isWebview = () =>
  is_fb_webview() ||
  is_twitter_webview() ||
  user_agent.getBrowser().name.includes('Webview');
export const isInAppBrowser = () =>
  !is_desktop() &&
  !is_ig_lite() &&
  [
    /Twitter/,
    /Line/,
    /KAKAOTALK/,
    /YJApp/,
    /Pinterest/,
    /buzzfeed/,
    /Flipboard/,
    /CaWebApp/,
    /NAVER/,
    /lucra/
  ].some(is_ua_match);

export const isUCBrowser = () => is_browser('UCBrowser');
export const isFirefox = () => is_browser('Firefox');
// 😁
export const isChromeWithBuggyInputFile = () =>
  is_os('Android') &&
  is_browser('Chrome') &&
  user_agent.getBrowser().version &&
  user_agent.getBrowser().version.startsWith('66.0.');
export const isIgLiteEligible = () =>
  passes_gatekeeper._('8') && is_os('Android > 4.4');
export const isBrowserWithFlexboxRelativeHeightIssue = () =>
  is_os('Android < 6') || is_os('iOS < 11');

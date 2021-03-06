import UserAgentData from './UserAgentData';

import VersionRange from './VersionRange';

import mapObject from './mapObject';

import memoizeStringOnly from './memoizeStringOnly';

/**
 * Checks to see whether `name` and `version` satisfy `query`.
 */
function compare(
  name: string,
  version: string,
  query: string,
  normalizer?: Function
): boolean {
  // check for exact match with no version
  if (name === query) {
    return true;
  } // check for non-matching names

  if (!query.startsWith(name)) {
    return false;
  } // full comparison with version

  let range = query.slice(name.length);

  if (version) {
    range = normalizer ? normalizer(range) : range;
    return VersionRange.contains(range, version);
  }

  return false;
}

/**
 * Normalizes `version` by stripping any "NT" prefix, but only on the Windows
 * platform.
 *
 * Mimics the stripping performed by the `UserAgentWindowsPlatform` PHP class.
 */
function normalizePlatformVersion(version: string): string {
  if (UserAgentData.platformName === 'Windows') {
    return version.replace(/^\s*NT/, '');
  }

  return version;
}

/**
 * Provides client-side access to the authoritative PHP-generated User Agent
 * information supplied by the server.
 */
const UserAgent = {
  /**
   * Check if the User Agent browser matches `query`.
   *
   * `query` should be a string like "Chrome" or "Chrome > 33".
   *
   * Valid browser names include:
   *
   * - ACCESS NetFront
   * - AOL
   * - Amazon Silk
   * - Android
   * - BlackBerry
   * - BlackBerry PlayBook
   * - Chrome
   * - Chrome for iOS
   * - Chrome frame
   * - Facebook PHP SDK
   * - Facebook for iOS
   * - Firefox
   * - IE
   * - IE Mobile
   * - Mobile Safari
   * - Motorola Internet Browser
   * - Nokia
   * - Openwave Mobile Browser
   * - Opera
   * - Opera Mini
   * - Opera Mobile
   * - Safari
   * - UIWebView
   * - Unknown
   * - webOS
   * - etc...
   *
   * An authoritative list can be found in the PHP `BrowserDetector` class and
   * related classes in the same file (see calls to `new UserAgentBrowser` here:
   * https://fburl.com/50728104).
   *
   * @note Function results are memoized
   */
  isBrowser(query: string): boolean {
    return compare(
      UserAgentData.browserName,
      UserAgentData.browserFullVersion,
      query
    );
  },

  /**
   * Check if the User Agent browser uses a 32 or 64 bit architecture.
   *
   * @note Function results are memoized
   *
   * @param query Query of the form "32" or "64".
   */
  isBrowserArchitecture(query: string): boolean {
    return compare(UserAgentData.browserArchitecture, null, query);
  },

  /**
   * Check if the User Agent device matches `query`.
   *
   * `query` should be a string like "iPhone" or "iPad".
   *
   * Valid device names include:
   *
   * - Kindle
   * - Kindle Fire
   * - Unknown
   * - iPad
   * - iPhone
   * - iPod
   * - etc...
   *
   * An authoritative list can be found in the PHP `DeviceDetector` class and
   * related classes in the same file (see calls to `new UserAgentDevice` here:
   * https://fburl.com/50728332).
   *
   * @note Function results are memoized
   *
   * @param query Query of the form "Name"
   */
  isDevice(query: string): boolean {
    return compare(UserAgentData.deviceName, null, query);
  },

  /**
   * Check if the User Agent rendering engine matches `query`.
   *
   * `query` should be a string like "WebKit" or "WebKit >= 537".
   *
   * Valid engine names include:
   *
   * - Gecko
   * - Presto
   * - Trident
   * - WebKit
   * - etc...
   *
   * An authoritative list can be found in the PHP `RenderingEngineDetector`
   * class related classes in the same file (see calls to `new
   * UserAgentRenderingEngine` here: https://fburl.com/50728617).
   *
   * @note Function results are memoized
   *
   * @param query Query of the form "Name [range expression]"
   */
  isEngine(query: string): boolean {
    return compare(
      UserAgentData.engineName,
      UserAgentData.engineVersion,
      query
    );
  },

  /**
   * Check if the User Agent platform matches `query`.
   *
   * `query` should be a string like "Windows" or "iOS 5 - 6".
   *
   * Valid platform names include:
   *
   * - Android
   * - BlackBerry OS
   * - Java ME
   * - Linux
   * - Mac OS X
   * - Mac OS X Calendar
   * - Mac OS X Internet Account
   * - Symbian
   * - SymbianOS
   * - Windows
   * - Windows Mobile
   * - Windows Phone
   * - iOS
   * - iOS Facebook Integration Account
   * - iOS Facebook Social Sharing UI
   * - webOS
   * - Chrome OS
   * - etc...
   *
   * An authoritative list can be found in the PHP `PlatformDetector` class and
   * related classes in the same file (see calls to `new UserAgentPlatform`
   * here: https://fburl.com/50729226).
   *
   * @note Function results are memoized
   *
   * @param query Query of the form "Name [range expression]"
   */
  isPlatform(query: string): boolean {
    return compare(
      UserAgentData.platformName,
      UserAgentData.platformFullVersion,
      query,
      normalizePlatformVersion
    );
  },

  /**
   * Check if the User Agent platform is a 32 or 64 bit architecture.
   *
   * @note Function results are memoized
   *
   * @param query Query of the form "32" or "64".
   */
  isPlatformArchitecture(query: string): boolean {
    return compare(UserAgentData.platformArchitecture, null, query);
  }
};

export default mapObject(UserAgent, memoizeStringOnly);

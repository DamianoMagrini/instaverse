/**
 * @module device-constants
 *
 * Constants about the device.
 *
 * Dependencies: none
 */

export type PlatformType =
  | 'unknown'
  | 'ios'
  | 'android'
  | 'blackberry'
  | 'windows_phone'
  | 'web'
  | 'windows_phone_10'
  | 'windows_nt_10'
  | 'osmeta_windows_phone'
  | 'osmeta_windows_tablet'
  | 'osmeta_tizen'
  | 'osmeta_default';

const DEVICE_CONSTANTS = {
  appPlatformTypes: {
    UNKNOWN: 'unknown',
    IOS: 'ios',
    ANDROID: 'android',
    BLACKBERRY: 'blackberry',
    WINDOWSPHONE: 'windows_phone',
    WEB: 'web',
    WINDOWSPHONE10: 'windows_phone_10',
    WINDOWSNT10: 'windows_nt_10',
    OSMETA_WINDOWS_PHONE: 'osmeta_windows_phone',
    OSMETA_WINDOWS_TABLET: 'osmeta_windows_tablet',
    OSMETA_TIZEN: 'osmeta_tizen',
    OSMETA_DEFAULT: 'osmeta_default'
  } as { [key: string]: PlatformType },
  appPlatformIndex: { UNKNOWN: -1, IOS: 0, ANDROID: 1 },
  appleAppStoreAppId: '389801252',
  appleAppStoreUrl: 'https://itunes.apple.com/app/instagram/id389801252',
  instagramFBAppId: '124024574287414',
  instagramWebFBAppId: '1217981644879628',
  instagramWebDesktopFBAppId: '936619743392459',
  igLiteAppId: '152431142231154',
  instagramGoogleClientId:
    '51884436741-uudfu5nafa5ufh5e4fks8jv5aa8rgddd.apps.googleusercontent.com',
  appVersionForLogging: '1.0.0',
  instagramWebClientToken: '65a937f07619e8d4dce239c462a447ce',
  instagramWebDesktopClientToken: '3cdb3f896252a1db29679cb4554db266',
  igLiteClientToken: '0c20b150a63e609a804abbb9925df651',
  googlePlayUrl:
    'https://play.google.com/store/apps/details?id=com.instagram.android',
  googlePlayIgLiteUrl:
    'https://play.google.com/store/apps/details?id=com.instagram.lite',
  windowsPhoneAppStoreUrl:
    'http://www.windowsphone.com/s?appid=3222a126-7f20-4273-ab4a-161120b21aea',
  osmetaWindowsPhoneAppStoreUrl:
    'https://www.microsoft.com/en-us/store/apps/instagram/9nblggh5l9xt',
  unknownDownloadUrl: '/download/',
  pressSiteUrl: 'https://instagram-press.com/'
};

export default DEVICE_CONSTANTS;

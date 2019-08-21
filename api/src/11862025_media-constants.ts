/**
 * @module media-constants
 *
 * Constants for uploaing media.
 *
 * Dependencies: none
 */

export const MediaTypes = {
  IMAGE: 1,
  VIDEO: 2,
  ALBUM: 3,
  WEBVIEW: 4,
  BUNDLE: 5,
  MAP: 6,
  BROADCAST: 7,
  CAROUSEL_V2: 8,
  COLLECTION: 10,
  AUDIO: 11,
  ANIMATED_MEDIA: 12,
  STATIC_STICKER: 13
};

export const FEED_MINIMUM_VIDEO_DURATION = 2.5;
export const FEED_MAXIMUM_VIDEO_DURATION = 60.5;
export const IMAGE_ASPECT_RATIO_MIN = 0.792;
export const IMAGE_ASPECT_RATIO_MAX = 1.9291;
export const VIDEO_ASPECT_RATIO_MIN = 0.8;

export const VIDEOTRANSFORM = { center_crop: 'center_crop' };

export const getMediaTypeCanonical = (media_type_number: number) =>
  Object.keys(MediaTypes)[
    Object.values(MediaTypes).indexOf(media_type_number)
  ].toLowerCase();

export const enum MediaPublishMode {
  FEED = 'default',
  REEL = 'reel',
  ALBUM = 'album',
  PROFILE_PIC = 'profile_pic',
  LIVE_REACTION = 'live_reaction',
  DRAFT = 'draft',
  PROFILE = 'profile',
  NAMETAG_SELFIE = 'nametag_selfie',
  IGTV = 'igtv',
  IGTV_DRAFT = 'igtv_draft',
  IGTV_WITH_FEED = 'igtv_with_feed'
}

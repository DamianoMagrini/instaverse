/**
 * @module thread-constants
 *
 * Constants about threads.
 *
 * Dependencies: none
 */

export const ThreadItemType = {
  DELETION: 'deletion',
  MEDIA: 'media',
  TEXT: 'text',
  LIKE: 'like',
  HASHTAG: 'hashtag',
  PROFILE: 'profile',
  MEDIA_SHARE: 'media_share',
  LOCATION: 'location',
  ACTION_LOG: 'action_log',
  TITLE: 'title',
  USER_REACTION: 'user_reaction',
  HISTORY_EDIT: 'history_edit',
  REACTION_LOG: 'reaction_log',
  REEL_SHARE: 'reel_share',
  DEPRECATED_CHANNEL: 'deprecated_channel',
  LINK: 'link',
  RAVEN_MEDIA: 'raven_media',
  LIVE_VIDEO_SHARE: 'live_video_share',
  TEST: 'test',
  STORY_SHARE: 'story_share',
  REEL_REACT: 'reel_react',
  LIVE_INVITE_GUEST: 'live_invite_guest',
  LIVE_VIEWER_INVITE: 'live_viewer_invite',
  TYPE_MAX: 'type_max',
  PLACEHOLDER: 'placeholder',
  PRODUCT: 'product',
  PRODUCT_SHARE: 'product_share',
  VIDEO_CALL_EVENT: 'video_call_event',
  POLL_VOTE: 'poll_vote',
  FELIX_SHARE: 'felix_share',
  ANIMATED_MEDIA: 'animated_media',
  CTA_LINK: 'cta_link',
  VOICE_MEDIA: 'voice_media',
  STATIC_STICKER: 'static_sticker',
  AR_EFFECT: 'ar_effect',
  SELFIE_STICKER: 'selfie_sticker'
};

export const TypingStatus = { OFF: 0, TEXT: 1, VISUAL: 2 };

export const LikeAction = { CREATED: 'created', DELETED: 'deleted' };

export const RavenMediaViewMode = {
  REPLAYABLE: 'replayable',
  PERMANENT: 'permanent'
};

export const PROD_MQTT_GATEWAY = 'wss://edge-chat.instagram.com/chat';

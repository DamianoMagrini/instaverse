/**
 * @module logging-constants
 *
 * Constants for logging.
 *
 * Dependencies: none
 */

export default Object.freeze({
  notif: {
    to_web: 'true',
    to_web_with_open: 'false',
    to_web_with_redirect: 'true'
  },

  log_cont: {
    has_contextual_d: 'false',
    has_contextual_m: 'false'
  },

  onetaplogin: {
    default_value: 'false',
    disable_app_upsell: 'false',
    during_reg: 'false',
    enabled: 'false',
    storage_version: 'one_tap_storage_version'
  },

  multireg_iter: {
    has_prioritized_phone: 'false',
    has_client_email_validation: 'false',
    has_back_removed: 'false',
    has_new_phone_form: 'true'
  },

  felix_clear_fb_cookie: {
    is_enabled: 'false',
    whitelist: '',
    blacklist: 'fbsr_124024574287414'
  },

  felix_creation_duration_limits: {
    minimum_length_seconds: '15',
    maximum_length_seconds: '3600'
  },

  felix_creation_fb_crossposting: {
    is_enabled: 'true'
  },

  felix_creation_fb_crossposting_v2: {
    is_enabled: 'true',
    display_version: '1'
  },

  felix_creation_validation: {
    cover_aspect_ratio_width: '4',
    cover_aspect_ratio_height: '5',
    cover_aspect_ratio_crop_width: '9',
    cover_aspect_ratio_crop_height: '16',
    edit_video_controls: 'true',
    max_video_size_in_bytes: '3600000000',
    minimum_length_for_feed_preview_seconds: '60',
    valid_cover_mime_types: 'image/jpeg',
    valid_video_mime_types: 'video/mp4',
    valid_video_extensions: 'mp4',
    title_maximum_length: '75',
    description_maximum_length: '2200',
    video_aspect_ratio_width: '4',
    video_aspect_ratio_height: '5',
    reencode_to_jpeg_mime_types: ''
  },

  mweb_topical_explore: {
    should_show_quilt: 'false'
  },

  app_upsell: {
    has_new_app_upsell_sheet: 'true',
    has_desktop_upsell_removed: 'false',
    has_no_app_upsells: 'false',
    has_iglite_link: 'false',
    has_no_app_iglite_upsells: 'false',
    has_iglite_new_content: 'false'
  },

  post_options: {
    enable_igtv_embed: 'false'
  },

  dev_ig_web_stories_universe: {
    disable_fullscreen: 'false',
    show_tappable_area: 'false',
    write_seen_data: 'true'
  },

  wss2: {
    has_app_upsell: 'false'
  },

  iglscioi: {
    has_skip: 'true'
  },

  igl_app_upsell: {
    has_only_iglite_link: 'false',
    has_iglite_content_and_link: 'false',
    has_no_upsell: 'false'
  },

  onetap: {
    has_checkbox: 'false',
    has_remove_content: 'false',
    has_lo_dialog: 'false'
  },

  sticker_tray: {
    has_quiz_sticker: false
  },

  web_sentry: {
    show_feedback: 'false'
  }
});

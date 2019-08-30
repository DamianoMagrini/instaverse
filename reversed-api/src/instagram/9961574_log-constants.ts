/**
 * @module log-constants
 *
 * Conventional codes for event logging.
 *
 * Dependencies: none
 */

export const enum IgWebQuickLogModule {
  APP_START = 27459588,
  EMBED_LOAD = 27459587,
  IG_FEED_LOAD = 27459585,
  IG_FEED_LOAD_MORE = 27459586,
  IG_REPORT = 27459592,
  PRESENT_STORY_VIEWER = 27459589,
  STORY_NAVIGATION = 27459590,
  STORY_TRAY_LOAD = 27459591
}

export const enum IgWebDirectQuickLogModule {
  IG_INBOX_FETCH = 35586049,
  IG_THREAD_FETCH = 35586051
}

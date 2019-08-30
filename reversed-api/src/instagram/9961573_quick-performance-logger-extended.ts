/**
 * @module quick-performance-logger-extended
 *
 * An extension to quick-performance-logger (14876786).
 *
 * Dependencies:
 *  - log-constants (9961574)
 *  - user-agent (9568276)
 *  - quick-performance-logger (14876786)
 */

import * as LOG_CONSTANTS from './9961574_log-constants';
import * as user_agent from './9568276_user-agent';
import QuickPerformanceLogger from './14876786_quick-performance-logger';

class QuickPerformanceLoggerExtended extends QuickPerformanceLogger {
  constructor() {
    super();
    this.initialize();
  }

  private initialize() {
    this.setAlwaysOnSampleRate(
      LOG_CONSTANTS.IgWebQuickLogModule.IG_FEED_LOAD,
      10000
    );
    this.setAlwaysOnSampleRate(LOG_CONSTANTS.IgWebQuickLogModule.IG_REPORT, 1);
    this.setAlwaysOnSampleRate(
      LOG_CONSTANTS.IgWebDirectQuickLogModule.IG_INBOX_FETCH,
      10
    );
    this.setAlwaysOnSampleRate(
      LOG_CONSTANTS.IgWebDirectQuickLogModule.IG_THREAD_FETCH,
      10
    );
    if (user_agent.isIgLite())
      this.setAlwaysOnSampleRate(
        LOG_CONSTANTS.IgWebQuickLogModule.APP_START,
        20
      );
    else
      this.setAlwaysOnSampleRate(
        LOG_CONSTANTS.IgWebQuickLogModule.APP_START,
        5000
      );
    this.setAlwaysOnSampleRate(
      LOG_CONSTANTS.IgWebQuickLogModule.STORY_TRAY_LOAD,
      1
    );
    this.setAlwaysOnSampleRate(
      LOG_CONSTANTS.IgWebQuickLogModule.STORY_NAVIGATION,
      10
    );
    this.setAlwaysOnSampleRate(
      LOG_CONSTANTS.IgWebQuickLogModule.PRESENT_STORY_VIEWER,
      1
    );
  }

  __computeSampleRate = (
    sample_1: number,
    sample_2: number,
    sample_3: number
  ) => (sample_1 !== null ? sample_1 : sample_3);
}

export default new QuickPerformanceLoggerExtended();

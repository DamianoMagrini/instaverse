/**
 * @module caching-support
 *
 * Get info about caching support.
 *
 * Dependencies:
 *  - config (9568270)
 *  - user-agent (9568276)
 *  - service-worker (9961602)
 *  - get-qe (9568383)
 */

import * as config from './9568270_config';
import * as user_agent from './9568276_user-agent';
import * as service_worker from './9961602_service-worker';
import * as get_qe from './9568383_get-qe';

export const isHTMLCachingEnabled = () =>
  !config.isCanary() &&
  user_agent.isIgLite() &&
  config.isLoggedIn() &&
  service_worker.getSupportedFeatures().serviceWorker &&
  (get_qe._('29', '0') || false);

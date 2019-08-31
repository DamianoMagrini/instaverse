/**
 * @module direct-support
 *
 * Whether the client supports directs or not.
 *
 * Dependencies:
 *  - get-qe (9568383)
 *  - user-agent (9568276)
 *  - passes-gatekeeper (9568392)
 */

import * as get_qe from './9568383_get-qe';
import * as user_agent from './9568276_user-agent';
import passes_gatekeeper from './9568392_passes-gatekeeper';

import { LogExposureOptions } from './14876734_log-exposure';

export const getDirectEligibility = (options: LogExposureOptions) => {
  const qe = get_qe._('0', '0', options);
  return qe === null ? user_agent.isMobile() || user_agent.isIgLite() : qe;
};

export const igLiteSupportsDirect = () => user_agent.isIgLiteVersion('>= 39');

export const hasDirect = (options: LogExposureOptions) =>
  user_agent.isDesktop()
    ? passes_gatekeeper._('10')
    : user_agent.isIgLite()
    ? !!igLiteSupportsDirect() && getDirectEligibility(options)
    : getDirectEligibility(options);

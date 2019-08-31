/**
 * @module get-qe
 *
 * Get a QE value (whatever it is).
 *
 * Dependencies:
 *  - log-exposure (14876734)
 *  - get-qe-override (14876735)
 *  - config (9568270)
 */

import * as log_exposure from './14876734_log-exposure';
import * as get_qe_override from './14876735_get-qe-override';
import * as config from './9568270_config';

export const _ = (
  qe: string,
  item: string,
  options?: log_exposure.LogExposureOptions
) => {
  log_exposure.logQexExposure(qe, options);

  const overridden_qe = get_qe_override.getQEOverride(qe, item);
  if (overridden_qe !== null) return overridden_qe;

  const qe_object = config.getQEMap()[qe];
  return (
    qe_object !== null &&
    qe_object !== undefined &&
    'p' in qe_object &&
    qe_object.p[item]
  );
};

export const _l = log_exposure.logQexExposure;

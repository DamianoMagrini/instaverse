/// <reference path="index.d.ts" />

/**
 * @module log-exposure
 *
 * Log QEX exposure (whatever it means).
 *
 * Dependencies:
 *  - mid (9699338)
 *  - banzai-shared (14876728)
 *  - banzai (9568348)
 */

import * as mid from './9699338_mid';
import * as banzai_shared from './14876728_banzai-shared';
import * as banzai from './9568348_banzai';

export interface LogExposureOptions {
  silent?: boolean;
  signal?: any;
  vital?: boolean;
}

window.__igExposedQEX = window.__igExposedQEX || {};

export const logQexExposure = (
  universe_id: string,
  options?: LogExposureOptions
) => {
  if (
    (options && options.silent) === true ||
    window.__igExposedQEX.hasOwnProperty(universe_id)
  )
    return;

  const data = {
    universe_id,
    mid: mid.getMID().toUpperCase()
  };

  const post_options: banzai.PostOptions = {
    signal: (options && options.signal) || undefined,
    ...((options && options.vital) === true
      ? { delay: banzai_shared.VITAL_WAIT }
      : {})
  };

  banzai.post('qex:expose', data, post_options);
  window.__igExposedQEX[universe_id] = true;
};

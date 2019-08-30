/**
 * @module get-gatekeeper-fp
 *
 * Returns the `fp` gatekeeper, whatever it is.
 *
 * Dependencies:
 *  - config (9568270)
 */

import * as config from './9568270_config';

var get_gatekeeper_fp = function() {
  const gatekeepers = config.getGatekeepers();
  return gatekeepers ? { fp: gatekeepers.fp } : {};
};

export default get_gatekeeper_fp;

/**
 * @module store-logging-params
 *
 * A function to store user and user agent logging params into cache.
 *
 * Dependencies:
 *  - sw-constants (14876672)
 *  - config (9568270)
 *  - mid (9699338)
 */

import * as SW_CONSTANTS from './14876672_sw-constants';
import * as config from './9568270_config';
import * as mid from './9699338_mid';

const enum ERRORS {
  CANNOT_STORE_CACHE_UNSUPPORTED = 'Unable to store logging params, cache storage unsupported'
}

export const storeLoggingParams = async () => {
  let cache: Cache;
  if (caches)
    cache = await caches.open(SW_CONSTANTS.SW_CACHE_NAMES.loggingParams);
  else throw new Error(ERRORS.CANNOT_STORE_CACHE_UNSUPPORTED);

  if (cache) {
    const logging_params = {
      appId: config.getIGAppID(),
      bundleVariant: config.getBundleVariant(),
      deploymentStage: config.getDeploymentStage(),
      graphToken: config.getGraphTokenForApp(),
      isCanary: config.isCanary(),
      isPrerelease: false,
      mid: mid.getMID(),
      rollout: config.getRolloutHash(),
      userAgent: navigator.userAgent,
      userId: config.getViewerId()
    };

    return await cache.put(
      SW_CONSTANTS.LOGGING_PARAMS,
      new Response(JSON.stringify(logging_params))
    );
  }

  throw new Error(ERRORS.CANNOT_STORE_CACHE_UNSUPPORTED);
};

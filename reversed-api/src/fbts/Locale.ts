/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule Locale
 */
import SiteData from './SiteData';

import ExecutionEnvironment from './ExecutionEnvironment';

function isRTL() {
  if (!ExecutionEnvironment.canUseDOM) {
    return false;
  } else {
    return SiteData.is_rtl;
  }
}

var Locale = {
  isRTL: isRTL
};
export default Locale;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule getVendorPrefixedName
 * @typechecks
 */
import ExecutionEnvironment from './ExecutionEnvironment';

import UserAgent from './UserAgent';

import camelize from './camelize';

import invariant from './invariant';

const memoized = {};
const prefixes = ['Webkit', 'ms', 'Moz', 'O'];
const prefixRegex = new RegExp('^(' + prefixes.join('|') + ')');
const testStyle = ExecutionEnvironment.canUseDOM
  ? document.createElement('div').style
  : {};

function getWithPrefix(name) {
  for (let i = 0; i < prefixes.length; i++) {
    const prefixedName = prefixes[i] + name;

    if (prefixedName in testStyle) {
      return prefixedName;
    }
  }

  return null;
}

function guessVendorPrefixedNameFromUserAgent(name) {
  switch (name) {
    case 'lineClamp':
      if (UserAgent.isEngine('WebKit >= 315.14.2')) {
        return 'WebkitLineClamp';
      }

      return null;

    default:
      return null;
  }
}

/**
 * @param {string} property Name of a css property to check for.
 * @return {?string} property name supported in the browser, or null if not
 * supported.
 */
function getVendorPrefixedName(property) {
  const name = camelize(property);

  if (memoized[name] === undefined) {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    if (prefixRegex.test(capitalizedName)) {
      invariant(
        false,
        'getVendorPrefixedName must only be called with unprefixed' +
          'CSS property names. It was called with %s',
        property
      );
    }

    if (ExecutionEnvironment.canUseDOM) {
      memoized[name] =
        name in testStyle ? name : getWithPrefix(capitalizedName);
    } else {
      memoized[name] = guessVendorPrefixedNameFromUserAgent(name);
    }
  }

  return memoized[name];
}

export default getVendorPrefixedName;

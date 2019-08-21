/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule resolveImmediate
 * @flow
 */
const resolvedPromise = Promise.resolve();

/**
 * An alternative to setImmediate based on Promise.
 */
function resolveImmediate(callback: () => any): void {
  resolvedPromise.then(callback).catch(throwNext);
}

function throwNext(error) {
  setTimeout(() => {
    throw error;
  }, 0);
}

export default resolveImmediate;

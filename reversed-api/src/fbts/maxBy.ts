/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule maxBy
 * @flow
 */
import minBy from './minBy';

var compareNumber = (a: number, b: number) => a - b;

/**
 * Returns the maximum element as measured by a scoring function f. Returns the
 * first such element if there are ties.
 */
function maxBy<A, B>(
  as: Iterable<A>,
  f: (a: A) => B,
  compare?: (u: B, v: B) => number | null
): A | null {
  compare = compare || (compareNumber as any);
  return minBy(as, f, (u, v) => (compare as any)(v, u));
}

export default maxBy;

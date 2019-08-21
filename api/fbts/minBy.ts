/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule minBy
 * @flow
 */
var compareNumber = (a: number, b: number) => a - b;

/**
 * Returns the minimum element as measured by a scoring function f. Returns the
 * first such element if there are ties.
 */
function minBy<A, B>(
  as: Iterable<A>,
  f: (a: A) => B,
  compare?: (u: B, v: B) => number | null
): A | null {
  compare = compare || (compareNumber as any);
  var minA = undefined;
  var minB = undefined;
  var seenFirst = false;

  for (var a of as) {
    var b = f(a);

    if (!seenFirst || compare(b, minB as any) < 0) {
      minA = a;
      minB = b;
      seenFirst = true;
    }
  }

  return minA;
}

export default minBy;

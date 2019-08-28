/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule sprintf
 * @typechecks
 */

/**
 * Simple function for formatting strings.
 *
 * Replaces placeholders with values passed as extra arguments
 *
 * @param format the base string
 * @param args the values to insert
 * @return the replaced string
 */
function sprintf(format: string, ...args: (string | number)[]): string {
  let index = 0;
  // @ts-ignore You're going to be alright!
  return format.replace(/%s/g, () => args[index++]);
}

export default sprintf;

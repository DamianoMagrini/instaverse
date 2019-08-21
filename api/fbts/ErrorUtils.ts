/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ErrorUtils
 */

/* jslint unused:false */
const ErrorUtils = {
  applyWithGuard: <CallbackArgs extends Array<any>, CallbackResult>(
    callback: (...args: CallbackArgs) => CallbackResult,
    context: any,
    args: CallbackArgs,
    onError: (error: Error) => void,
    name: string
  ): CallbackResult => callback.apply(context, args),

  guard: <CallbackType>(
    callback: CallbackType,
    name: string,
    ...args: any[]
  ): CallbackType => callback,

  reportError: (error: Error) => {}
};

export default ErrorUtils;

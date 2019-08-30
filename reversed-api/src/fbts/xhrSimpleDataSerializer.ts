/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule xhrSimpleDataSerializer
 */
function xhrSimpleDataSerializer(data: { [key: string]: any }) {
  var uri = [];

  for (let key in data) {
    uri.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
  }

  return uri.join('&');
}

export default xhrSimpleDataSerializer;

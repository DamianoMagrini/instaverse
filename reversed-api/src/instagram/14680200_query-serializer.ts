/**
 * @module query-serializer
 *
 * Dependencies:
 *  - invariant-ex (9502825)
 */

import invariant_ex from './9502825_invariant-ex';

function serialize(obj: object | string) {
  return serializeRecursive(obj, null);
}

function serializeRecursive(obj?: object | string, prefix?: string): string {
  prefix = prefix || '';
  var params = [];
  if (obj === null || obj === undefined) {
    params.push(encodeComponent(prefix));
  } else if (typeof obj == 'object') {
    // obj should not be an element node
    invariant_ex(!('nodeName' in obj || 'nodeType' in obj));
    for (var r in obj) {
      if (obj.hasOwnProperty(r) && obj[r] !== undefined) {
        params.push(
          serializeRecursive(obj[r], prefix ? prefix + '[' + r + ']' : r)
        );
      }
    }
  } else {
    params.push(encodeComponent(prefix) + '=' + encodeComponent(obj));
  }
  return params.join('&');
}

function encodeComponent(uri_component: string | number | boolean) {
  return encodeURIComponent(uri_component)
    .replace(/%5D/g, ']')
    .replace(/%5B/g, '[');
}

function deserialize(query_string: string): { [key: string]: any } {
  if (!query_string) {
    return {};
  }

  query_string = query_string.replace(/%5B/gi, '[').replace(/%5D/gi, ']');

  const result: any = {};
  const params = query_string.split('&');
  const owns = Object.prototype.hasOwnProperty;

  for (let r = 0, s = params.length; r < s; r++) {
    const nested_key_value_pair = params[r].match(
      /^([-_\w]+)((?:\[[-_\w]*\])+)=?(.*)/
    );

    if (!nested_key_value_pair) {
      const kvPair = params[r].split('=');
      result[decodeComponent(kvPair[0])] =
        kvPair[1] === undefined ? null : decodeComponent(kvPair[1]);
    } else {
      const namespace = nested_key_value_pair[2]
        .split(/\]\[|\[|\]/)
        .slice(0, -1);
      const rootKey = nested_key_value_pair[1];
      const value = decodeComponent(nested_key_value_pair[3] || '');
      namespace[0] = rootKey;
      var current_root = result;

      // fill in any holes for each namespace level
      for (var z = 0; z < namespace.length - 1; z++) {
        if (namespace[z]) {
          if (!owns.call(current_root, namespace[z])) {
            var aa =
              namespace[z + 1] && !namespace[z + 1].match(/^\d{1,3}$/)
                ? {}
                : [];
            current_root[namespace[z]] = aa;
            if (current_root[namespace[z]] !== aa) {
              return result;
            }
          }
          current_root = current_root[namespace[z]];
        } else {
          if (namespace[z + 1] && !namespace[z + 1].match(/^\d{1,3}$/)) {
            current_root.push({});
          } else current_root.push([]);
          current_root = current_root[current_root.length - 1];
        }
      }

      // set value at the leaf node
      if (
        current_root instanceof Array &&
        namespace[namespace.length - 1] === ''
      ) {
        current_root.push(value);
      } else {
        current_root[namespace[namespace.length - 1]] = value;
      }
    }
  }
  return result;
}

function decodeComponent(component: string) {
  return decodeURIComponent(component.replace(/\+/g, ' '));
}

export interface Serializer {
  serialize: (obj: object | string) => string;
  encodeComponent: (uri_component: string | number | boolean) => string;
  deserialize: (query_string: string) => { [key: string]: any };
  decodeComponent: (component: string) => string;
}

export default {
  serialize,
  encodeComponent,
  deserialize,
  decodeComponent
} as Serializer;

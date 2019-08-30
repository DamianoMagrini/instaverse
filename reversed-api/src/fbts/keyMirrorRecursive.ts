import invariant from './invariant';

/**
 * Constructs an enumeration with keys equal to their value. If the value is an
 * object, the method is run recursively, including the parent key as a suffix.
 * An optional prefix can be provided that will be prepended to each value.
 *
 * For example:
 *
 *   var ACTIONS = keyMirror({FOO: null, BAR: { BAZ: null, BOZ: null }}});
 *   ACTIONS.BAR.BAZ = 'BAR.BAZ';
 *
 *   Input:  {key1: null, key2: { nested1: null, nested2: null }}}
 *   Output: {key1: key1, key2: { nested1: nested1, nested2: nested2 }}}
 *
 *   var CONSTANTS = keyMirror({FOO: {BAR: null}}, 'NameSpace');
 *   console.log(CONSTANTS.FOO.BAR); // NameSpace.FOO.BAR
 */
function keyMirrorRecursive<T>(object: T, prefix?: string): T {
  return keyMirrorRecursiveInternal(object, prefix);
}

function keyMirrorRecursiveInternal<T>(object: T, prefix?: string): T {
  const ret: any = {};
  invariant(
    isObject(object),
    'keyMirrorRecursive(...): Argument must be an object.'
  );

  for (let key in object) {
    if (!object.hasOwnProperty(key)) {
      continue;
    }

    let value = object[key];
    var newPrefix = prefix ? prefix + '.' + key : key;

    if (isObject(value)) {
      value = keyMirrorRecursiveInternal(value, newPrefix);
    } else {
      value = (<unknown>newPrefix) as T[Extract<keyof T, string>];
    }

    ret[key] = value;
  }

  return ret;
}

function isObject(obj: any) {
  return obj instanceof Object && !Array.isArray(obj);
}

export default keyMirrorRecursive;

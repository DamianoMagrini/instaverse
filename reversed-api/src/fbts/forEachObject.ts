var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Executes the provided `callback` once for each enumerable own property in the
 * object. The `callback` is invoked with three arguments:
 *
 *  - the property value
 *  - the property name
 *  - the object being traversed
 *
 * Properties that are added after the call to `forEachObject` will not be
 * visited by `callback`. If the values of existing properties are changed, the
 * value passed to `callback` will be the value at the time `forEachObject`
 * visits them. Properties that are deleted before being visited are not
 * visited.
 */
function forEachObject<Keys extends string | number, Values, ThisArg>(
  object: { [key in Keys]: Values },
  callback: (
    this: ThisArg,
    value: Values,
    key: Keys,
    object: { [key in Keys]: Values }
  ) => void,
  thisArg?: ThisArg
) {
  for (const key in object) {
    if (hasOwnProperty.call(object, key)) {
      callback.call(thisArg, object[key], key, object);
    }
  }
}

export default forEachObject;

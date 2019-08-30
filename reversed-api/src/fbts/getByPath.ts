/**
 * Get a value from an object based on the given path
 *
 * Usage example:
 *
 *   var obj = {
 *     a : {
 *       b : 123
 *     }
 *   };
 *
 * var result = getByPath(obj, ['a', 'b']); // 123
 *
 * You may also specify the path using an object with a path field
 *
 * var result = getByPath(obj, {path: ['a', 'b']}); // 123
 *
 * If the path doesn't exist undefined will be returned
 *
 * var result = getByPath(obj, ['x', 'y', 'z']); // undefined
 */

function getByPath(
  root: /*?Object | Error*/
  any,
  path: Array<string>,
  fallbackValue?: any
): any {
  let current = root;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i]; // Use 'in' to check entire prototype chain since immutable js records
    // use prototypes

    if (current && segment in current) {
      current = current[segment];
    } else {
      return fallbackValue;
    }
  }

  return current;
}

export default getByPath;

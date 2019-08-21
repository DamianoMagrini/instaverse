/**
 * @module filter-object
 *
 * Filter an object (duh).
 *
 * Dependencies: none
 */

export default function<ObjectType extends Object, FilterThis>(
  object: ObjectType,
  filter: (
    this: FilterThis,
    value: any,
    key: keyof ObjectType,
    object: ObjectType
  ) => boolean,
  filter_this?: FilterThis
) {
  if (!object) return null;

  const filtered_object: any = {};
  for (let key in object)
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      filter.call(filter_this, object[key], key, object)
    )
      filtered_object[key] = object[key];

  return filtered_object;
};

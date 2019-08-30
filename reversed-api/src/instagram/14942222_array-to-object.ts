const array_to_object = (
  array,
  values?: (string | number | boolean) | (string | number | boolean)[]
) => {
  const object = {};

  var c = Array.isArray(values);
  if (values === undefined) values = true;

  for (let index = 0; index < array.length; index++)
    object[array[index]] = c ? values[index] : values;

  return object;
};

export default array_to_object;

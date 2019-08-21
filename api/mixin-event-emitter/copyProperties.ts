const copyProperties = (
  target: { [key: string]: any },
  ...sources: { [key: string]: any }[]
) => {
  target = target || {};

  if (process.env.NODE_ENV !== 'production') {
    if (f) {
      throw new Error('Too many arguments passed to copyProperties');
    }
  }

  for (let source of sources) {
    for (var key in source) {
      target[key] = source[key];
    }

    if (
      source.hasOwnProperty &&
      source.hasOwnProperty('toString') &&
      typeof source.toString !== 'undefined' &&
      target.toString !== source.toString
    ) {
      target.toString = source.toString;
    }
  }

  return target;
};

export default copyProperties;

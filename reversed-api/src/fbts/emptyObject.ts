declare var __DEV__: boolean;
const emptyObject = {};

if (__DEV__) {
  Object.freeze(emptyObject);
}

export default emptyObject;

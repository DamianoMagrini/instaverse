// This hopefully supports the React Native case, which is already bringing along
// its own fetch polyfill. That should exist on `global`. If that doesn't exist
// then we'll try to polyfill, which might not work correctly in all environments.

import fetch from 'isomorphic-fetch';
export default fetch;

// setimmediate adds setImmediate to the global. We want to make sure we export
// the actual function.

import 'setimmediate';
export default global.setImmediate;

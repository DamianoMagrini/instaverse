/**
 * @module falco-log
 *
 * Quick logging with falco (9830523).
 *
 * Dependencies:
 *  - falco (9830523)
 */

import * as falco from './9830523_falco';

const providers = { falco: false, pigeon: true };

export default class FalcoLog {
  static log(get_data: () => any) {
    falco.FalcoLogger.log('perf', get_data(), {}, providers);
  }
}

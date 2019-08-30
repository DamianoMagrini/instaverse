/**
 * @module passes-gatekeeper
 *
 * ...
 * Prevents an A → B circular dependency between user-agent (9568276) and
 * config (9568270), and instead makes it an A → B → C circular dependency.
 * Wow.
 * . . .
 * Also, for some reason, it's used in 9830424, which depends on config itself. Why.
 *
 * Dependencies:
 *  - config (9568270)
 */

import * as config from './9568270_config';

const passes_gatekeeper = {
  _: (gatekeeper_id: string) => config.passesGatekeeper(gatekeeper_id)
};

export default passes_gatekeeper;

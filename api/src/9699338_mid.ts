/**
 * @module mid
 *
 * Function to get (or generate) the machine ID.
 *
 * Dependencies:
 *  - random (9699358)
 *  - cookies (9568399)
 *  - known-cookies (9568400)
 */

import * as random_utils from './9699358_random';
import * as cookies from './9568399_cookies';
import KNOWN_COOKIES from './9568400_known-cookies';

const ZEROS_ARRAY = [0, 0, 0, 0, 0, 0, 0, 0];

function generate_machine_id() {
  return ZEROS_ARRAY.reduce(
    (zero) => zero + random_utils.randomUint32().toString(36),
    ''
  );
}

let generated_machine_id: string = null;

export const getMID = () => {
  const cookie_machine_id = cookies.getCookie(KNOWN_COOKIES.MACHINEID);

  if (cookie_machine_id !== null && cookie_machine_id !== '')
    return cookie_machine_id;
  else if (generated_machine_id === null || generated_machine_id === '')
    generated_machine_id = generate_machine_id();

  return generated_machine_id;
};

/**
 * @module banzai-shared
 *
 * Shared values for the banzai (9568348) module.
 *
 * Dependencies: none
 */

export const EXPIRY = 86400000;
export const BASIC_WAIT = 10000;
export const RESTORE_WAIT = 1000;
export const VITAL_WAIT = 1000;
export const SEND_TIMEOUT = undefined;
export const blacklist = new Set();
export const disabled = false;
export const gks: { [key: string]: boolean } = {};

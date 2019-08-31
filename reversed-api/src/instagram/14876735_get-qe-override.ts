/**
 * @module get-qe-override
 *
 * Get a QE's (whatever it is) local override.
 *
 * Dependencies:
 *  - storage (9699368)
 */

import * as storage from './9699368_storage';

export const getOverrideKey = (qe: string, item: string) => `qe_${qe}__${item}`;

export const getQEOverrideAsString = (qe: string, item: string) => {
  const session_storage = storage.getSessionStorage();
  const local_storage = storage.getLocalStorage();

  if (
    !session_storage ||
    !local_storage ||
    !session_storage.getItem('qe_check_overrides')
  )
    return null;

  const override_key = getOverrideKey(qe, item);
  return (
    session_storage.getItem(override_key) || local_storage.getItem(override_key)
  );
};

export const getQEOverride = (qe: string, item: string) => {
  const override_string = getQEOverrideAsString(qe, item);
  if (override_string === null) return null;

  if (override_string === 'true') return true;
  if (override_string === 'false') return false;

  const ovverride_number = Number(override_string);
  return Number.isNaN(ovverride_number) ? override_string : ovverride_number;
};

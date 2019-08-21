/**
 * @module empty-lists
 *
 * Empty lists for followers and followees.
 *
 * Dependencies:
 *  - immutable (former 2, now node_module)
 */

import immutable from 'immutable';

const empty_list = { userIds: immutable.List(), pagination: undefined };
export const EMPTY_LISTS = {
  inbound: empty_list,
  outbound: empty_list,
  inboundMutual: empty_list,
  outboundMutual: empty_list
};

/**
 * @module get-follow-data
 *
 * Module to get followers and followees.
 *
 * Dependencies:
 *  - pagination (9961589)
 *  - get-follow-constants (14680159)
 *  - empty-lists (12779530)
 *  - expect-non-null (9568264)
 */

import * as pagination from './9961589_pagination';
import * as GET_FOLLOW_CONSTANTS from './14680159_get-follow-constants';
import * as empty_lists from './12779530_empty-lists';
import expect_non_null from './9568264_expect-non-null';

const FOLLOWED_BY_QUERY_ID = 'c76146de99bb02f6415203be841dd25a';
const FOLLOWING_QUERY_ID = 'd04b0a864b4b54837c0d870b0e77e076';

const PAGES_TO_PRELOAD = 1;

export const _actionCreators = {
  inbound: generate_action_creator('inbound'),
  outbound: generate_action_creator('outbound')
};

function generate_action_creator(listType: 'inbound' | 'outbound') {
  let queryId: string;
  let key = 'edge_follow';
  switch (listType) {
    case 'inbound':
      queryId = FOLLOWED_BY_QUERY_ID;
      key = 'edge_followed_by';
      break;
    case 'outbound':
      queryId = FOLLOWING_QUERY_ID;
      key = 'edge_follow';
      break;
    default:
      throw new Error(`Invalid listType: ${listType}`);
  }
  return pagination.generatePaginationActionCreators({
    pageSize: GET_FOLLOW_CONSTANTS.PAGE_SIZE,
    pagesToPreload: PAGES_TO_PRELOAD,
    getState: (t, n) =>
      t.followLists.get(n, empty_lists.EMPTY_LISTS)[listType].pagination,
    queryId,
    queryParams: (id: string, fetch_mutual: boolean) => ({
      id,
      include_reel: true,
      fetch_mutual
    }),
    onUpdate(fetch, data, userId) {
      const l = data && expect_non_null(data.user)[key];
      const _ = data && expect_non_null(data.user).edge_mutual_followed_by;
      return {
        type: GET_FOLLOW_CONSTANTS.FOLLOW_LIST_REQUEST_UPDATED,
        listType,
        userId,
        users: (
          (l === null || l === undefined ? undefined : l.edges) || []
        ).map((o) => o.node),
        mutualUsers: (
          (_ === null || _ === undefined ? undefined : _.edges) || []
        ).map((o) => o.node),
        pageInfo: l === null || l === undefined ? undefined : l.page_info,
        fetch
      };
    },
    onError: (error, fetch, userId) => ({
      type: GET_FOLLOW_CONSTANTS.FOLLOW_LIST_REQUEST_FAILED,
      listType,
      userId,
      fetch
    })
  });
}

export const requestFollowList = function(o, t, n = false) {
  return _actionCreators[t].first(o, n);
};

export const requestNextFollowListPage = function(o, t, n = false) {
  return _actionCreators[t].next(o, n);
};

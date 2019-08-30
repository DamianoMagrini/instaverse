/**
 * @module pagination
 *
 * There was too little context for me to be able to decompile this module
 * properly. Help is gladly accepted!
 *
 * Dependencies:
 *  - api (9568362)
 *  - throw-error-async (9568361)
 *  - invariant-ex (9502825)
 *  - emptyFunction (former 65, which points to former 68, now
 *    fbts/emptyFunction)
 *  - log-error (9568324)
 *  - normalize-page (14876784)
 */

import * as api from './_starting-point-1_9568362_api';
import throw_error_async from './9568361_throw-error-async';
import invariant_ex from './9502825_invariant-ex';
import emptyFunction from '../fbts/emptyFunction';
import log_error from './9568324_log-error';
import normalize_page from './14876784_normalize-page';

const DEFAULT_PAGE_DATA = {
  hasNextPage: null,
  hasPreviousPage: null,
  startCursor: null,
  endCursor: null,
  visibleCount: 0,
  loadedCount: 0,
  isFetching: false
};

const FETCH_NOOP = 'FETCH_NOOP';
const FETCH_FIRST = 'FETCH_FIRST';
const FETCH_FIRST_AFTER = 'FETCH_FIRST_AFTER';
const FETCH_FAILURE = 'FETCH_FAILURE';

export const hasNextPage = (data = DEFAULT_PAGE_DATA) =>
  (data.loadedCount && data.loadedCount > data.visibleCount) ||
  data.hasNextPage;
export const getVisibleCount = (data = DEFAULT_PAGE_DATA) => data.visibleCount;
export const getLoadedCount = (data = DEFAULT_PAGE_DATA) => data.loadedCount;
export const isFetching = (data = DEFAULT_PAGE_DATA) => data.isFetching;

interface FetchData {
  type: string;
  visibleTarget?: number;
  isFetching?: boolean;
}

export const generatePaginationActionCreators = ({
  pageSize = 12,
  pagesToPreload = 1,
  getState,
  queryId,
  queryParams,
  queryOptions,
  queryBefore,
  onUpdate,
  onError
}: {
  pageSize: number;
  pagesToPreload?: number;
  getState?;
  queryId?:
    | string
    | {
        (id: string, fetch_mutual: boolean, a, b, c, d): string;
      };
  queryParams?: (id: string, fetch_mutual: boolean, a, b, c, d) => object;
  queryOptions?;
  queryBefore?;
  onUpdate?: (
    fetch: FetchData,
    data,
    userId: string,
    a,
    b,
    c,
    d,
    e?
  ) => {
    type: string;
    listType;
    userId;
    users;
    mutualUsers;
    pageInfo;
    fetch;
  };
  onError?: (
    error: any,
    fetch: FetchData,
    userId: string,
    a,
    b,
    c,
    d,
    e
  ) => {
    type: string;
    listType;
    userId;
    fetch;
  };
}) => {
  function T(params, id, fetch_mutual, s, u, l, c) {
    const query_hash =
      typeof queryId === 'function'
        ? queryId(id, fetch_mutual, s, u, l, c)
        : queryId;

    return api.query(
      query_hash,
      {
        ...(queryParams === null
          ? {}
          : queryParams(id, fetch_mutual, s, u, l, c)),
        ...params
      },
      queryOptions,
      queryBefore
    );
  }

  return {
    firstPrefetched: (data, userId, u, l, C, h, F) => (
      callback,
      get_fetch_data
    ) =>
      getState(get_fetch_data(), userId, u, l, C, h, F)
        ? Promise.resolve()
        : callback(
            onUpdate(
              { type: FETCH_FIRST, visibleTarget: pageSize, isFetching: false },
              data,
              userId,
              u,
              l,
              C,
              h,
              F
            )
          ),

    first: (data, userId, h, F, f, P) => (callback, get_fetch_data) => {
      if (getState(get_fetch_data(), data, userId, h, F, f, P))
        return Promise.resolve();
      callback(
        onUpdate(
          { type: FETCH_NOOP, visibleTarget: pageSize, isFetching: true },
          undefined,
          data,
          userId,
          h,
          F,
          f,
          P
        )
      );
      return throw_error_async(
        T(
          { first: pageSize * (pagesToPreload + 1) },
          data,
          userId,
          h,
          F,
          f,
          P
        ).then(
          ({ data }) =>
            callback(
              onUpdate(
                {
                  type: FETCH_FIRST,
                  visibleTarget: pageSize,
                  isFetching: false
                },
                data,
                userId,
                h,
                F,
                f,
                P
              )
            ),
          (error) =>
            callback(
              onError(error, { type: FETCH_FAILURE }, data, userId, h, F, f, P)
            )
        )
      );
    },

    next: (data, userId, h, F, f, P) => (callback, get_fetch_data) => {
      const state = getState(get_fetch_data(), data, userId, h, F, f, P);
      invariant_ex(state);
      const {
        hasNextPage,
        endCursor,
        visibleCount,
        loadedCount,
        isFetching
      } = state;

      if (isFetching)
        return (
          emptyFunction(false, 'can only perform one fetch at a time'),
          Promise.resolve()
        );

      invariant_ex(hasNextPage !== null);
      const I = visibleCount + pageSize,
        O =
          hasNextPage &&
          !!(I > loadedCount || (pagesToPreload && I + pageSize > loadedCount));

      if (visibleCount < loadedCount || O)
        callback(
          onUpdate(
            { type: FETCH_NOOP, visibleTarget: I, isFetching: O },
            undefined,
            data,
            userId,
            h,
            F,
            f,
            P
          )
        );
      else
        log_error(
          'could not update, check hasNextPage before calling getNextPageFetch'
        );

      if (O) {
        invariant_ex(endCursor !== null && endCursor !== '');
        const n = I - loadedCount + pageSize * pagesToPreload;
        return throw_error_async(
          T({ first: n, after: endCursor }, data, userId, h, F, f, P).then(
            ({ data: t }) =>
              callback(
                onUpdate(
                  {
                    type: FETCH_FIRST_AFTER,
                    visibleTarget: I,
                    isFetching: false
                  },
                  t,
                  data,
                  userId,
                  h,
                  F,
                  f,
                  P
                )
              ),
            (t) =>
              callback(
                onError(t, { type: FETCH_FAILURE }, data, userId, h, F, f, P)
              )
          )
        );
      }

      return Promise.resolve();
    }
  };
};

export const reduceFetchResult = function(
  page_data = DEFAULT_PAGE_DATA,
  action: FetchData,
  loaded: any[],
  page: { has_next_page: boolean; end_cursor: string },
  nothing_visible = false
) {
  let { visibleCount, loadedCount, isFetching } = page_data;
  const normalized_page = page ? normalize_page(page) : {};
  switch (action.type) {
    case FETCH_NOOP:
      visibleCount = Math.min(action.visibleTarget, loadedCount);
      isFetching = action.isFetching;
      break;
    case FETCH_FIRST:
      loadedCount = 0;
    case FETCH_FIRST_AFTER:
      invariant_ex(loaded !== null && page !== null);
      loadedCount += loaded.length;
      visibleCount = nothing_visible
        ? 0
        : Math.min(action.visibleTarget, loadedCount);
      isFetching = action.isFetching;
      break;
    case FETCH_FAILURE:
      isFetching = false;
      break;
  }
  return {
    ...page_data,
    ...normalized_page,
    visibleCount,
    loadedCount,
    isFetching
  };
};

export const reducePrefetchedResult = (
  visible_count: number,
  loaded: any[],
  page: { has_next_page: boolean; end_cursor: string },
  nothing_visible = false
) => ({
  ...DEFAULT_PAGE_DATA,
  ...normalize_page(page),
  visibleCount: nothing_visible ? 0 : Math.min(visible_count, loaded.length),
  loadedCount: loaded.length
});

export const updatePaginationCounts = function(
  data = DEFAULT_PAGE_DATA,
  get_page_data: (page_data: {
    visibleCount: number;
    loadedCount: number;
  }) => Partial<typeof DEFAULT_PAGE_DATA>
) {
  let { visibleCount, loadedCount } = {
    ...data,
    ...get_page_data({
      visibleCount: data.visibleCount,
      loadedCount: data.loadedCount
    })
  };
  visibleCount = Math.min(visibleCount, loadedCount);
  return { ...data, visibleCount: visibleCount, loadedCount: loadedCount };
};

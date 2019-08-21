/**
 * @module ppr
 *
 * Utilities to log the time it took to load a post (I think). PPR stands for
 * "Percentage Photo Rendered" (as can be seen in 9961525).
 *
 * Dependencies:
 *  - performance (former 9961516, now @fbts/performance)
 */

import performance from '@fbts/performance';

export interface PPR {
  isGridView: boolean;
  loadTime: number;
  mediaId: string;
  pageId: string;
  timeEnteredViewport: number;
  timeInViewport?: number;
  timeTaken?: number;
}

const ppr_map = new Map<string, PPR>();
const load_times = new Map();

export const getPPRKey = (media_id: string, page_id: string) =>
  `${page_id}_${media_id}`;

export const PPR_LOGGING_THRESHOLD = 250;

export const clearPPRMap = ppr_map.clear;

export const flushMediaStillInViewport = (): PPR[] => {
  const ppr_array = Array.from(ppr_map.values());
  ppr_map.clear();
  return ppr_array;
};

export const setMediaEntersViewport = ({
  isGridView,
  mediaId,
  pageId
}: PPR): void => {
  const ppr_key = getPPRKey(mediaId, pageId);
  if (ppr_map.has(ppr_key)) return;
  const ppr = {
    isGridView,
    loadTime: load_times.get(ppr_key),
    mediaId,
    pageId,
    timeEnteredViewport: performance.now()
  };
  ppr_map.set(ppr_key, ppr);
};

export const setMediaRendered = ({ mediaId, pageId, timeTaken }: PPR): void => {
  const ppr_key = getPPRKey(mediaId, pageId);
  const ppr = ppr_map.get(ppr_key);
  if (ppr) ppr.loadTime = timeTaken;
  else if (!load_times.has(ppr_key)) load_times.set(ppr_key, timeTaken);
};

export const setMediaLeavesViewport = ({ mediaId, pageId }: PPR): PPR => {
  const ppr_key = getPPRKey(mediaId, pageId);
  const ppr = ppr_map.get(ppr_key);
  if (ppr && ppr.timeInViewport === undefined)
    ppr.timeInViewport = performance.now() - ppr.timeEnteredViewport;
  return ppr;
};

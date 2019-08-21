/// <reference path="index.d.ts" />

/**
 * @module log-performance
 *
 * Utilities for logging loading performance.
 *
 * Dependencies:
 *  - logging (9568346)
 *  - events (9568347)
 *  - timings (9568293)
 *  - timeout-emulated (14352467)
 *  - log-constants (9961574)
 *  - quick-performance-logger-extended (9961573)
 *  - instance-ids (9961579)
 *  - buffer-timings (12255291)
 *  - passes-gatekeeper (9568392)
 *  - config (9568270)
 *  - page-ids (9568272)
 *  - ppr (11993123)
 *  - performance (former 9961516, now @fbts/performance)
 *  - hash-32 (14876785)
 */

import * as logging from './9568346_logging';
import * as events from './9568347_events';
import * as timings from './9568293_timings';
import timeout_emulated from './14352467_timeout-emulated';
import * as LOG_CONSTANTS from './9961574_log-constants';
import quick_performance_logger_extended from './9961573_quick-performance-logger-extended';
import instance_ids from './9961579_instance-ids';
import * as buffer_timings from './12255291_buffer-timings';
import passes_gatekeeper from './9568392_passes-gatekeeper';
import * as config from './9568270_config';
import page_ids from './9568272_page-ids';
import * as ppr from './11993123_ppr';
import performance from '@fbts/performance';
import get_intance_key from './14876785_get-instance-key';

import { PostOptions } from './9568348_banzai';

const APP_START_MARKER_ID = LOG_CONSTANTS.IgWebQuickLogModule.APP_START;

const MAX_FID_VALUE = 10000;
const LOG_PAGE_RESOURCE_METRICS_DELAY = 10000;

let current_page_id = '';
let first_page_load = true;
let resource_metrics_locked = true;

const ppr_keys = new Set<string>();

export const logResourceTransferSize = (
  data: {
    resourceType: string;
    resourceCount: number;
    transferSize: number;
    fromFullPageLoad: boolean;
    pageId: string;
  },
  options: PostOptions
) => {
  logging.logPigeonEvent(
    events.createEvent(
      'instagram_web_resource_transfer_size_events',
      {
        resource_type: data.resourceType,
        resources_count: data.resourceCount,
        transfer_size: data.transferSize,
        full_page_load: data.fromFullPageLoad,
        ...logging.getExtra()
      },
      { module: data.pageId || '' }
    ),
    options
  );
};

export const logResourceTiming = (data, t) => {
  const { url, page_id, ...extra } = logging.getExtra(data.timings);
  logging.logPigeonEvent(
    events.createEvent(
      'instagram_web_resource_timing_events',
      {
        ...extra,
        event_type: data.eventType,
        full_page_load: data.fromFullPageLoad
      },
      {
        module: page_id,
        obj_type: 'url',
        obj_id: logging.trimAndSanitizeUrl(url || window.location.href)
      }
    ),
    t
  );
};

const get_connection_data = () => {
  const connection = window && window.navigator && window.navigator.connection;
  return connection &&
    connection.effectiveType &&
    connection.type &&
    connection.downlink &&
    connection.rtt
    ? {
        effectiveType: connection.effectiveType,
        connectionType: connection.type,
        downlink: Math.round(1000 * connection.downlink),
        rtt: connection.rtt
      }
    : null;
};

const log_connection_timings = (data: object, options: PostOptions) => {
  const { url, ...extra } = logging.getExtra(data);
  logging.logPigeonEvent(
    events.createEvent('instagram_web_client_connection_info', extra, {
      obj_type: 'url',
      obj_id: logging.trimAndSanitizeUrl(url || window.location.href)
    }),
    options
  );
};

const annotate_timings = (
  annotation: string,
  page_timings: timings.QPLPageTimings
) => {
  quick_performance_logger_extended.markerStart(
    APP_START_MARKER_ID,
    0,
    page_timings.navigationStart
  );
  quick_performance_logger_extended.annotateMarkerString(
    APP_START_MARKER_ID,
    'pageID',
    annotation
  );
  Object.keys(page_timings).forEach((timing_index) => {
    if (timing_index === 'navigationStart') return;
    const timing = page_timings[timing_index];
    timing !== null &&
      timing !== 0 &&
      quick_performance_logger_extended.markerPoint(
        APP_START_MARKER_ID,
        timing_index,
        undefined,
        0,
        timing
      );
  });
  quick_performance_logger_extended.markerEnd(
    APP_START_MARKER_ID,
    instance_ids.SUCCESS
  );
};

export const logPageResourceMetrics = (
  page_id: string,
  options: PostOptions
) => {
  if (!resource_metrics_locked) {
    current_page_id = page_id || current_page_id;
    ['script', 'img'].forEach((resource_type) => {
      const buffered_resource_timings = buffer_timings
        .getResourceTimings({ type: resource_type, pageId: current_page_id })
        .reduce(
          (accumulator, resource_timings) => {
            if (resource_type === 'script' && passes_gatekeeper._('5'))
              logResourceTiming(
                {
                  timings: resource_timings,
                  fromFullPageLoad: first_page_load,
                  eventType: ''
                },
                options
              );
            if (
              resource_timings.transfer_size > 0 ||
              resource_type === 'script'
            )
              accumulator.resourceCount++,
                (accumulator.transferSize += resource_timings.transfer_size);
            return accumulator;
          },
          {
            resourceType: resource_type,
            resourceCount: 0,
            transferSize: 0,
            fromFullPageLoad: first_page_load,
            pageId: current_page_id
          }
        );
      if (buffered_resource_timings.resourceCount > 0)
        logResourceTransferSize(buffered_resource_timings, options);
    });
    buffer_timings.bufferResourceTimings(current_page_id);
  }
};

const log_module_timings = (
  module_id: string,
  timings_data: timings.Timings,
  options: PostOptions
) => {
  const { url, ...extra } = logging.getExtra({
    ...timings_data,
    bundle_variant: config.getBundleVariant()
  });
  logging.logPigeonEvent(
    events.createEvent('instagram_web_client_perf_events', extra, {
      module: module_id,
      obj_type: 'url',
      obj_id: logging.trimAndSanitizeUrl(url || window.location.href)
    }),
    options
  );
};

export const logPercentagePhotoRendered = (percentage: ppr.PPR) => {
  let page_id = percentage.pageId;
  if (!page_id) return;
  if (page_id === 'feed') page_id = page_ids.feedPage;
  const ppr_key = ppr.getPPRKey(percentage.mediaId, page_id);
  if (!ppr_keys.has(ppr_key)) {
    ppr_keys.add(ppr_key);
    if (!percentage.timeInViewport)
      percentage.timeInViewport =
        performance.now() - percentage.timeEnteredViewport;
    if (percentage.timeInViewport >= ppr.PPR_LOGGING_THRESHOLD)
      logging.logPigeonEvent(
        events.createEvent(
          'ig_web_image_loading',
          {
            isGridView: percentage.isGridView,
            mediaId: percentage.mediaId,
            loadTime: Math.round(percentage.loadTime || 0),
            percentRendered:
              percentage.loadTime || 0 === percentage.loadTime ? 100 : 0,
            ...(get_connection_data() || {}),
            ...logging.getExtra()
          },
          { module: page_id }
        )
      );
  }
};

const log_module_event = (module_id: string, fid: number, event: Event) => {
  const fid_value = Math.round(fid);
  if (fid_value < MAX_FID_VALUE && fid_value >= 0)
    logging.logPigeonEvent(
      events.createEvent(
        'instagram_web_fid',
        { event_name: event.type, fid_value, ...logging.getExtra() },
        { module: module_id }
      )
    );
};

export const logAllPercentagePhotoRendered = () => {
  ppr.flushMediaStillInViewport().forEach((ppr) => {
    logPercentagePhotoRendered(ppr);
  });
};

export const _resetState = (state: {
  currentPageId: string;
  firstPageLoad: boolean;
  resourceMetricsLocked: boolean;
}) => {
  current_page_id =
    (state === null || state === undefined ? undefined : state.currentPageId) ||
    '';
  first_page_load = !!(state === null || state === undefined
    ? undefined
    : state.firstPageLoad);
  resource_metrics_locked = !!(state === null || state === undefined
    ? undefined
    : state.resourceMetricsLocked);
};

export const logInteractionPerformanceTiming = (
  data: ppr.PPR,
  options: PostOptions
) => {
  const { timeTaken, ...other_data } = data;
  logging.logPigeonEvent(
    events.createEvent('instagram_web_interaction_perf_events', {
      ...other_data,
      timeTaken: Math.round(timeTaken),
      ...logging.getExtra()
    }),
    options
  );
};

export const logComponentPerformanceTiming = (
  data: {
    component: 'FeedPage' | 'StoryTray';
    eventType: string;
    timeTaken: number;
    pageId: string;
    route: string;
  },
  options: PostOptions
) => {
  logging.logPigeonEvent(
    events.createEvent(
      'instagram_web_component_perf_events',
      {
        component: data.component,
        eventName: data.eventType,
        timeTaken: Math.round(data.timeTaken),
        ...logging.getExtra()
      },
      {
        module: data.pageId || '',
        obj_type: 'url',
        obj_id: logging.trimAndSanitizeUrl(data.route || '')
      }
    ),
    options
  );
};

export const logGraphQLQueryTiming = (
  query_hash: string,
  query_time: number,
  other_data?: object
) => {
  logging.logPigeonEvent(
    events.createEvent('instagram_web_graphql_timing_events', {
      query_hash,
      query_time,
      ...logging.getExtra()
    }),
    other_data
  );
};

export const initPerformanceLogger = (
  module_id: string,
  options: {
    reactRenderRequired: boolean;
    defaultDisplayDoneEvent: string;
    defaultTimeToInteractiveEvent: string;
    loggerOptions: PostOptions;
  }
) => {
  if (window.perfMetrics)
    window.perfMetrics.onFirstInputDelay((fid: number, event: Event) =>
      log_module_event(module_id, fid, event)
    );
  if ('performance' in window) {
    if (options)
      timings.setPageTimingOptions({
        reactRenderRequired: options.reactRenderRequired,
        defaultDisplayDoneEvent: options.defaultDisplayDoneEvent,
        defaultTimeToInteractiveEvent: options.defaultTimeToInteractiveEvent
      });
    timings.onPageTimingsAvailable((page_timings) => {
      log_module_timings(
        module_id,
        page_timings,
        options === null || options === undefined
          ? undefined
          : options.loggerOptions
      );
      const connection_data = get_connection_data();
      if (connection_data)
        log_connection_timings(
          connection_data,
          options === null || options === undefined
            ? undefined
            : options.loggerOptions
        );
      const qpl_page_timings = timings.getQPLPageTimings();
      if (qpl_page_timings !== null)
        annotate_timings(module_id, qpl_page_timings);
    });
    const log_page_resource_metrics_async = timeout_emulated(
      logPageResourceMetrics,
      LOG_PAGE_RESOURCE_METRICS_DELAY
    );
    document.addEventListener(
      'load',
      (event) => {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'IMG' ||
          target.tagName === 'SCRIPT' ||
          target.tagName === 'LINK'
        )
          log_page_resource_metrics_async(
            null,
            options === null || options === undefined
              ? undefined
              : options.loggerOptions
          );
      },
      true
    );
    if ('addEventListener' in window.performance)
      window.performance.addEventListener(
        'resourcetimingbufferfull',
        function() {
          logPageResourceMetrics(
            null,
            options === null || options === undefined
              ? undefined
              : options.loggerOptions
          );
        }
      );
    window.addEventListener('beforeunload', () => {
      resource_metrics_locked = false;
      logPageResourceMetrics(
        null,
        options === null || options === undefined
          ? undefined
          : options.loggerOptions
      );
      logAllPercentagePhotoRendered();
    });
  }
};

export const logPageResourceMetricsStart = (options: PostOptions) => {
  if (!first_page_load) logPageResourceMetrics(null, options);
  resource_metrics_locked = true;
};

export const logPageResourceMetricsEnd = (
  page_id: string,
  options: PostOptions
) => {
  resource_metrics_locked = false;
  logPageResourceMetrics(page_id, options);
  first_page_load = false;
};

export const getInstanceKeyFromId = (id: string) => get_intance_key(id);

/// <reference path="index.d.ts" />

/**
 * @module timings
 *
 * Utilities to measure timings.
 *
 * Dependencies:
 *  - performance (former 9961516, now @fbts/performance)
 *  - user-agent (9568276)
 *  - ig-lite-bindings (9830461)
 */

/*
  TODO
  If something goes wrong, change
  window && window.performance && window.performance.timing
  to
  (window && window.performance && window.performance.timing) || undefined
*/

import performance from '@fbts/performance';
import * as user_agent from './9568276_user-agent';
import * as ig_lite_bindings from './9830461_ig-lite-bindings';

let last_render_start_time = 0;
let time_spent_rendering = 0;

let load_event_listener_added = false;
let timings_available_callbacks = [];
let component_idle_callbacks = [];

let display_done_time = 0;
let time_to_interactive = 0;

let component_display_start_times: {
  FeedPage?: number;
  StoryTray?: number;
} = {};
let component_display_times: {
  FeedPage?: [number, number];
  StoryTray?: [number, number];
} = {};

let react_render_required = true;
let default_display_done_event = 'loadEventEnd';
let default_time_to_interactive_event = 'loadEventEnd';

export const isPerformanceMarkerSupported = () =>
  typeof performance === 'object' &&
  typeof performance.mark === 'function' &&
  typeof performance.measure === 'function';

const record_display_done = (now = performance.now()) => {
  display_done_time = now;
  user_agent.isIgLite() && ig_lite_bindings.markIgLiteColdStartFinished();
  if (isPerformanceMarkerSupported()) {
    performance.mark('displayDone-end');
    performance.measure('displayDone', 'fetchStart', 'displayDone-end');
  }
};

const record_time_to_interactive = (now = performance.now()) => {
  time_to_interactive = now;
  if (isPerformanceMarkerSupported()) {
    performance.mark('timeToInteractive-end');
    performance.measure(
      'timeToInteractive',
      'fetchStart',
      'timeToInteractive-end'
    );
  }
};

const get_display_done_time = (target: 'page' | 'component') => {
  const timing = window && window.performance && window.performance.timing;
  const is_component = target === 'component';
  return (
    timing &&
    timing.loadEventEnd &&
    (!react_render_required ||
      (last_render_start_time && time_spent_rendering)) &&
    !(is_component && Object.keys(component_display_start_times).length > 0) &&
    time_to_interactive &&
    display_done_time
  );
};

const get_first_paint_performance = () => {
  let firstPaint: number = null;
  let firstContentfulPaint: number = null;
  if (window.__bufferedPerformance)
    for (const performance_item of window.__bufferedPerformance)
      switch (performance_item.name) {
        case 'first-paint':
          firstPaint = Math.round(performance_item.startTime);
          break;
        case 'first-contentful-paint':
          firstContentfulPaint = Math.round(performance_item.startTime);
          break;
      }
  return { firstPaint, firstContentfulPaint };
};

export interface Timings {
  redirects: number;
  dns: number;
  connect: number;
  request: number;
  response: number;
  network: number;
  domInteractive: number;
  domContentLoaded: number;
  domComplete: number;
  loadEvent: number;
  displayDone: number;
  timeToInteractive: number;
  firstPaint: number;
  firstContentfulPaint: number;
  reactReady: number;
  reactRender: number;
}
const get_timings_if_ready = (target: 'page' | 'component'): Timings => {
  if (!get_display_done_time(target)) return null;
  const timing = window && window.performance && window.performance.timing;
  const { firstPaint, firstContentfulPaint } = get_first_paint_performance();

  let react_ready_time: number = null;
  let react_render_time: number = null;
  if (last_render_start_time && time_spent_rendering) {
    react_ready_time =
      Math.round(last_render_start_time) -
      (timing.domLoading - timing.navigationStart);
    react_render_time = Math.round(time_spent_rendering);
  }

  const timings = {
    redirects: timing.redirectEnd - timing.redirectStart,
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    connect: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    network: timing.domLoading - timing.navigationStart,
    domInteractive: timing.domInteractive - timing.domLoading,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.domLoading,
    domComplete: timing.domComplete - timing.domLoading,
    loadEvent: timing.loadEventEnd - timing.domLoading,
    displayDone: Math.round(display_done_time),
    timeToInteractive: Math.round(time_to_interactive),
    firstPaint,
    firstContentfulPaint,
    reactReady: react_ready_time,
    reactRender: react_render_time
  };

  return Object.keys(timings).reduce(
    (accumulator, value) =>
      accumulator && (timings[value] === null || timings[value] >= 0),
    true
  )
    ? timings
    : null;
};

const get_timing = (first_timing: number, second_timing: number) =>
  first_timing !== null &&
  second_timing !== null &&
  second_timing > 0 &&
  second_timing < first_timing
    ? first_timing + second_timing
    : second_timing;

const bind_event = (
  callback: (timings: Timings) => void,
  target: 'page' | 'component'
) => {
  const timings = get_timings_if_ready(target);
  if (timings) callback(timings);
  else {
    if (target === 'page') timings_available_callbacks.push(callback);
    else component_idle_callbacks.push(callback);

    if (!load_event_listener_added && 'addEventListener' in window) {
      load_event_listener_added = true;
      window.addEventListener('load', function() {
        setTimeout(() => {
          const timing =
            window && window.performance && window.performance.timing;
          if (!timing) return;

          const navigation_start_time = timing.navigationStart;
          if (!time_to_interactive)
            record_time_to_interactive(
              timing[default_time_to_interactive_event] - navigation_start_time
            );
          if (
            !Object.keys(component_display_start_times).length &&
            !display_done_time
          )
            record_display_done(
              timing[default_display_done_event] - navigation_start_time
            );
          run_callbacks();
        }, 0);
      });
    }
  }
};

const run_callbacks = () => {
  if (timings_available_callbacks.length) {
    const timings = get_timings_if_ready('page');
    if (timings) {
      timings_available_callbacks.forEach((callback) => callback(timings));
      timings_available_callbacks = [];
    }
  }
  run_components_idle_callbacks();
};

const run_components_idle_callbacks = () => {
  if (component_idle_callbacks.length > 0) {
    const timings = get_timings_if_ready('component');
    if (timings) {
      component_idle_callbacks.forEach((callback) => callback(timings));
      component_idle_callbacks = [];
    }
  }
};

export const _reset = function() {
  last_render_start_time = 0;
  time_spent_rendering = 0;

  load_event_listener_added = false;
  timings_available_callbacks = [];
  component_idle_callbacks = [];

  display_done_time = 0;
  time_to_interactive = 0;

  component_display_start_times = {};
  component_display_times = {};
};

export const setPageTimingOptions = function(options: {
  reactRenderRequired: boolean;
  defaultDisplayDoneEvent: string;
  defaultTimeToInteractiveEvent: string;
}) {
  react_render_required = options.reactRenderRequired;
  default_display_done_event = options.defaultDisplayDoneEvent;
  default_time_to_interactive_event = options.defaultTimeToInteractiveEvent;
};

export type QPLPageTimings = ReturnType<typeof getQPLPageTimings>;
export const getQPLPageTimings = () => {
  if (!get_display_done_time('page')) return null;
  const timing = window && window.performance && window.performance.timing;
  const navigation_start_time = timing.navigationStart;
  const { firstPaint, firstContentfulPaint } = get_first_paint_performance();

  let react_start_time = null;
  let react_mounted_time = null;
  if (last_render_start_time && time_spent_rendering) {
    react_start_time = get_timing(
      navigation_start_time,
      Math.round(last_render_start_time)
    );
    react_mounted_time = react_start_time + Math.round(time_spent_rendering);
  }
  const timings = {
    navigationStart: timing.navigationStart,
    redirectStart: timing.redirectStart,
    redirectEnd: timing.redirectEnd,
    fetchStart: timing.fetchStart,
    domainLookupStart: timing.domainLookupStart,
    domainLookupEnd: timing.domainLookupEnd,
    connectStart: timing.connectStart,
    connectEnd: timing.connectEnd,
    requestStart: timing.requestStart,
    responseStart: timing.responseStart,
    responseEnd: timing.responseEnd,
    domLoading: timing.domLoading,
    domInteractive: timing.domInteractive,
    domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
    domComplete: timing.domComplete,
    loadEventEnd: timing.loadEventEnd,
    displayDone: get_timing(
      navigation_start_time,
      Math.round(display_done_time)
    ),
    timeToInteractive: get_timing(
      navigation_start_time,
      Math.round(time_to_interactive)
    ),
    reactStart: react_start_time,
    reactMounted: react_mounted_time,
    firstPaint: get_timing(navigation_start_time, firstPaint),
    firstContentfulPaint: get_timing(
      navigation_start_time,
      firstContentfulPaint
    )
  };
  Object.keys(component_display_times).forEach((component) => {
    timings['displayStart' + component] = get_timing(
      navigation_start_time,
      Math.round(component_display_times[component][0])
    );
    timings['displayEnd' + component] = get_timing(
      navigation_start_time,
      Math.round(component_display_times[component][1])
    );
  });
  return timings;
};

export const onPageTimingsAvailable = (
  callback: (timings: Timings) => void
) => {
  bind_event(callback, 'page');
};

export const onComponentsIdle = (callback: (timings: Timings) => void) => {
  bind_event(callback, 'component');
};

export const timedRender = function(
  render_function: (component: any, children: any, props: any) => any,
  component: any,
  children: any,
  props: any
) {
  const start_time = performance.now();
  if (!last_render_start_time) last_render_start_time = start_time;
  render_function(component, children, props);
  time_spent_rendering += performance.now() - start_time;
  run_callbacks();
};

export const componentDisplayStart = (component: 'FeedPage' | 'StoryTray') => {
  component_display_start_times[component] = performance.now();
};

export const componentDisplayDone = (component: 'FeedPage' | 'StoryTray') => {
  component_display_times[component] = [
    component_display_start_times[component],
    performance.now()
  ];
  ig_lite_bindings.markIgLiteDisplayDone(component);
  delete component_display_start_times[component];

  const no_component_display_start_times_recorded =
    Object.keys(component_display_start_times).length === 0;
  if (!display_done_time && no_component_display_start_times_recorded)
    requestAnimationFrame(() => {
      record_display_done(performance.now());
      run_callbacks();
    });
  else if (no_component_display_start_times_recorded)
    run_components_idle_callbacks();
};

export const recordInteractive = () => {
  if (time_to_interactive)
    requestAnimationFrame(() => {
      record_time_to_interactive();
      run_callbacks();
    });
};

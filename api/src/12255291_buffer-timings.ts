/**
 * @module buffer-timings
 *
 * Functions to add and retrieve timings from and to a buffer, but only if they
 * correspond to resources sent via a first-party server.
 *
 * Dependencies: none
 */

const MATCH_RESOURCE_DATA = /\/bundles\/([^.]+)(\.js)?\/(.+)\.js(\?control=.*)?$/;
const MATCH_RESOURCE_LANG = /^(\w+\/)?([a-z]{2}_[A-Z]{2})(\/.*)?$/;
const IS_FIRST_PARTY_DOMAIN = /^https:\/\/(.*\.)?((cdn)?instagram\.com|facebook\.(com|net))(:[0-9]*)?\//;
const resource_timings_buffer = new Map<string, TimingData>();

export type TimingData = ReturnType<typeof generate_timing_data>;

const is_first_party = (timing_entry: PerformanceResourceTiming) =>
  ['img', 'script', 'link'].indexOf(timing_entry.initiatorType) >= 0 &&
  timing_entry.name.match(IS_FIRST_PARTY_DOMAIN);

const generate_timing_data = (
  timing: PerformanceResourceTiming,
  page_id: string
) => {
  const data = {
    connect_start: Math.round(timing.connectStart),
    connect_time: Math.round(timing.connectEnd - timing.connectStart),
    decoded_body_size: Math.round(timing.decodedBodySize),
    domain_lookup_start: Math.round(timing.domainLookupStart),
    domain_lookup_time: Math.round(
      timing.domainLookupEnd - timing.domainLookupStart
    ),
    duration: Math.round(timing.duration),
    encoded_body_size: Math.round(timing.encodedBodySize),
    fetch_start: Math.round(timing.fetchStart),
    redirect_start: Math.round(timing.redirectStart),
    redirect_time: Math.round(timing.redirectEnd - timing.redirectStart),
    request_start: Math.round(timing.requestStart),
    response_start: Math.round(timing.responseStart),
    response_time: Math.round(timing.responseEnd - timing.responseStart),
    secure_connection_start: Math.round(timing.secureConnectionStart),
    start_time: Math.round(timing.startTime),
    transfer_size: Math.round(timing.transferSize),
    from_cache: !timing.transferSize,
    resource_name: timing.name,
    resource_type: timing.initiatorType,
    page_id: page_id !== null && page_id !== '' ? page_id : null,
    resource_hash: null,
    resource_lang: null
  };

  if (data.resource_type === 'script') {
    const resource_data = data.resource_name.match(MATCH_RESOURCE_DATA);
    if (resource_data) {
      data.resource_name = resource_data[1];
      data.resource_hash = resource_data[3];

      const lang_match = resource_data[1].match(MATCH_RESOURCE_LANG);
      if (lang_match !== null) data.resource_lang = lang_match[2];
    }
  }

  return data;
};

export const bufferResourceTimings = (page_id: string) => {
  const performance = window && window.performance;
  if (performance && performance.getEntriesByType)
    for (const entry of performance.getEntriesByType('resource'))
      is_first_party(entry as PerformanceResourceTiming) &&
        resource_timings_buffer.set(
          entry.name,
          generate_timing_data(entry as PerformanceResourceTiming, page_id)
        );

  if (performance && performance.clearResourceTimings)
    performance.clearResourceTimings();
};

export const getResourceTimings = (config: {
  type: string;
  pageId: string;
  includeBuffered?: boolean;
}) => {
  const get_entries_by_type =
    window && window.performance && window.performance.getEntriesByType;
  if (typeof get_entries_by_type !== 'function') return [];

  const data = get_entries_by_type('resouce')
    .filter(
      (timing) =>
        !config.type ||
        (timing as PerformanceResourceTiming).initiatorType === config.type
    )
    .filter(is_first_party)
    .map((timing) =>
      generate_timing_data(timing as PerformanceResourceTiming, config.pageId)
    );

  if (config.includeBuffered === true)
    for (const timing of resource_timings_buffer.values())
      if (!(config.type && timing.resource_type !== config.type))
        data.push(timing);

  return data;
};

export const getResourceTimingByName = (
  name: string,
  config: { pageId: string; includeBuffered: boolean }
) => {
  const get_entries_by_name =
    window && window.performance && window.performance.getEntriesByName;
  if (typeof get_entries_by_name !== 'function') return null;

  const entries = get_entries_by_name(name);
  for (const timing of entries)
    if (is_first_party(timing as PerformanceResourceTiming)) {
      const data = generate_timing_data(
        timing as PerformanceResourceTiming,
        config.pageId
      );
      if (data.resource_name === name) return data;
    }

  if (true === config.includeBuffered)
    for (const timing of resource_timings_buffer.values())
      if (name === timing.resource_name && config.pageId === timing.page_id)
        return timing;

  return null;
};

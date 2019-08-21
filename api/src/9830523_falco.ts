/**
 * @module falco
 *
 * Utilities for logging events.
 *
 * Dependencies:
 *  - config (9568270)
 *  - passes-gatekeeper (9568392)
 *  - http (9568364)
 *  - events (9568347)
 *  - banzai-shared (14876728)
 *  - query-serializer (14680200)
 *  - banzai (9568348)
 *  - logging (9568346)
 */

import * as config from './9568270_config';
import passes_gatekeeper from './9568392_passes-gatekeeper';
import * as http from './9568364_http';
import * as events from './9568347_events';
import * as banzai_shared from './14876728_banzai-shared';
import query_serializer from './14680200_query-serializer';
import * as banzai from './9568348_banzai';
import * as logging from './9568346_logging';

const FALCO_LOGGING_ENDPOINT = '/logging/falco';
const DEFAULT_LOGGING_PROVIDERS = { falco: false, pigeon: true };

export const FalcoLogger = {
  log(
    event_name: string,
    event_data: any,
    options: banzai.PostOptions,
    logging_providers = DEFAULT_LOGGING_PROVIDERS
  ) {
    if (logging_providers.falco)
      banzai.post('falco', events.createEvent(event_name, event_data), options);
    if (logging_providers.pigeon)
      logging.logPigeonEvent(events.createEvent(event_name, event_data));
  }
};

export const falcoSend = function(
  events_array: events.ExtendedEvent[],
  before_request_cb: (xhr: XMLHttpRequest) => void
): Promise<Response | void> {
  if (config.needsToConfirmCookies()) return Promise.resolve();
  else if (passes_gatekeeper._('29'))
    return http.post(
      FALCO_LOGGING_ENDPOINT,
      events.packageEvents(events_array),
      {
        contentType: 'application/x-www-form-urlencoded',
        omitAjaxHeader: true,
        omitLanguageParam: true,
        timeout: banzai_shared.SEND_TIMEOUT
      },
      before_request_cb
    );
  else return Promise.resolve();
};

export const falcoSendWithBeacon = function(
  events_array: events.ExtendedEvent[]
) {
  return (
    config.needsToConfirmCookies() ||
    !passes_gatekeeper._('29') ||
    window.navigator.sendBeacon(
      FALCO_LOGGING_ENDPOINT,
      new Blob(
        [query_serializer.serialize(events.packageEvents(events_array))],
        {
          type: 'application/x-www-form-urlencoded'
        }
      )
    )
  );
};

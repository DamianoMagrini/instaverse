/**
 * @module error-utils
 *
 * Utilities for errors and automatic reporting.
 *
 * Dependencies:
 *  - extended-error (14876720)
 *  - config (9568270)
 *  - http (9568364)
 */

import * as extended_error from './14876720_extended-error';
import * as config from './9568270_config';
import * as http from './9568364_http';

const PORTION_OF_ERRORS_TO_REPORT = 0.1;

let processing_error = false,
  monitoring_errors = false;

const logError = (error: Error) => {
  if (!monitoring_errors && window.__bufferedErrors)
    return void window.__bufferedErrors.push({ error: error });
  const normalized_error = extended_error.normalizeError(null, error);
  normalized_error && report_error(normalized_error, error);
};

function on_error(
  message: string,
  url: string,
  line: number,
  column: number,
  error_instance: Error
) {
  if (processing_error) {
    console.error('Error reported during error processing', message);
    return false;
  }

  processing_error = true;
  const normalized_error = extended_error.normalizeError(
    { message, url, line, column },
    error_instance
  );

  if (normalized_error) report_error(normalized_error, error_instance);
  processing_error = false;

  return false;
}

function report_error(
  normalized_error: extended_error.NormalError,
  original_error: Error
) {
  const error_data = {
    line: normalized_error.line,
    column: normalized_error.column,
    name: normalized_error.name,
    message: normalized_error.message,
    script: normalized_error.script,
    stack: normalized_error.stack,
    timestamp: Date.now(),
    ref: window.location.href,
    deployment_stage: config.getDeploymentStage(),
    is_canary: config.isCanary(),
    rollout_hash: config.getRolloutHash(),
    is_prerelease: false,
    bundle_variant: config.getBundleVariant(),
    request_url: normalized_error.requestUrl,
    response_status_code: normalized_error.responseStatusCode
  };

  if (
    (config.isCanary() || Math.random() <= PORTION_OF_ERRORS_TO_REPORT) &&
    ('AjaxError' !== error_data.name || error_data.response_status_code)
  )
    http
      .post('/client_error/', error_data, {
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
      })
      .catch(() => {});
}

export { logError };

export const monitorErrors = function() {
  monitoring_errors = true;
  window.onerror = on_error;

  const buffered_errors = window.__bufferedErrors;

  if (buffered_errors && buffered_errors.length)
    for (const error of buffered_errors)
      'message' in error
        ? on_error(
            error.message,
            error.url,
            error.line,
            error.column,
            error.error
          )
        : logError(error.error);

  delete window.__bufferedErrors;
};

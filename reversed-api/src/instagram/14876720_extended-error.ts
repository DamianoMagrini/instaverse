/**
 * @module extended-error
 *
 * More than just an error.
 *
 * Dependencies:
 *  - parse-error-string (14876721)
 *  - eprintf (14876722)
 */

import parse_error_string from './14876721_parse-error-string';
import eprintf from './14876722_eprintf';

const IS_SECURE_HOST = /^https?:\/\//i;
const IS_TYPE_MISMATCH = /^Type Mismatch for/;

const MATCH_ERROR_CODES = new RegExp(
  '(.*?)(\\s)(?:' +
    ['Unknown script code', 'Function code', 'eval code'].join('|') +
    ')$'
);

const MATCH_ERROR_LOCATION_1 = /(.*)(@|\s)[^\s]+$/;
const MATCH_ERROR_LOCATION_2 = /(:(\d+)(:(\d+))?)$/;
const MATCH_ERROR_LOCATION_3 = /[()]|\[.*?\]|^\w+:\s.*?\n/g;
const MATCH_ERROR_LOCATION_4 = /(at)?\s*(.*)([^\s]+|$)/;

interface CallStackFrame {
  identifier?: any;
  script: any;
  line: any;
  column: any;
  text?: string;
}

export type ExtendedError = Error & {
  stackTrace?: string;
  framesToPop?: number;
  messageWithParams?: string[];
  type?: any;
  fileName?: string;
  sourceURL?: string;
  script?: string;
  statusCode?: number;
  url?: string;
};

export interface NormalError {
  line: number;
  column: number;
  name: string;
  message: string;
  messageWithParams: any;
  type: any;
  script: any;
  stack: string;
  stackFrames: CallStackFrame[];
  responseStatusCode: any;
  requestUrl: string;
}

function parse_call_stack(stack?: string): CallStackFrame[] {
  return stack
    ? stack
        .split(/\n\n/)[0]
        .replace(MATCH_ERROR_LOCATION_3, '')
        .split('\n')
        .filter((message) => message.length)
        .map((message) => {
          let identifier: string,
            error_line = 0,
            error_column = 0,
            error_message = message.trim();

          const matches_location_2 = error_message.match(
            MATCH_ERROR_LOCATION_2
          );
          if (matches_location_2) {
            error_line = parseInt(matches_location_2[2]);
            error_column = parseInt(matches_location_2[4]);
            error_message = error_message.slice(
              0,
              -matches_location_2[0].length
            );
          }

          const error_location =
            error_message.match(MATCH_ERROR_CODES) ||
            error_message.match(MATCH_ERROR_LOCATION_1);

          if (error_location) {
            error_message = error_message.substring(
              error_location[1].length + 1
            );
            const filename = error_location[1].match(MATCH_ERROR_LOCATION_4);
            identifier = filename ? filename[2] : '';
          }
          return {
            identifier: identifier || '',
            script: error_message,
            line: error_line,
            column: error_column,
            text:
              '    at' +
              (identifier ? ' ' + identifier + ' (' : ' ') +
              error_message +
              (error_line ? ':' + error_line : '') +
              (error_column ? ':' + error_column : '') +
              (identifier ? ')' : '')
          };
        })
    : [];
}

export const ExtendedError = class extends Error {};

export const normalizeError = function(
  other_metadata: {
    line: number;
    column: number;
    message: string;
    url: string;
  },
  original_error: ExtendedError
): NormalError {
  if (!other_metadata && !original_error) return null;
  const error_stack = original_error
    ? parse_call_stack(original_error.stackTrace || original_error.stack)
    : [];
  let metadata_in_stack = false;

  if (
    original_error &&
    error_stack.length &&
    !error_stack[0].line &&
    !error_stack[0].column
  )
    original_error.framesToPop = (original_error.framesToPop || 0) + 1;

  if (original_error && null != original_error.framesToPop) {
    let stack_top: CallStackFrame;
    for (
      let frame_index = original_error.framesToPop;
      frame_index > 0 && error_stack.length > 0;
      frame_index--
    ) {
      stack_top = error_stack.shift();
      metadata_in_stack = true;
    }
    IS_TYPE_MISMATCH.test(original_error.message) &&
      2 === original_error.framesToPop &&
      stack_top &&
      IS_SECURE_HOST.test(stack_top.script) &&
      (original_error.message +=
        ' at ' +
        stack_top.script +
        (stack_top.line ? ':' + stack_top.line : '') +
        (stack_top.column ? ':' + stack_top.column : '')),
      delete original_error.framesToPop;
  }

  const normal_error = {
    line: 0,
    column: 0,
    name: original_error ? original_error.name : '',
    message: original_error ? original_error.message : '',
    messageWithParams:
      original_error && original_error.messageWithParams
        ? original_error.messageWithParams
        : [],
    type: original_error && original_error.type ? original_error.type : '',
    script: original_error
      ? original_error.fileName ||
        original_error.sourceURL ||
        original_error.script ||
        ''
      : '',
    stack: error_stack.map((fragment) => fragment.text).join('\n'),
    stackFrames: error_stack,
    responseStatusCode:
      original_error && null != original_error.statusCode
        ? original_error.statusCode
        : 0,
    requestUrl: original_error && original_error.url ? original_error.url : ''
  };

  if (other_metadata) {
    normal_error.line = other_metadata.line;
    normal_error.column = other_metadata.column;
    normal_error.message = other_metadata.message;
    normal_error.script = other_metadata.url;
  }
  if (metadata_in_stack) {
    delete normal_error.script;
    delete normal_error.line;
    delete normal_error.column;
  }
  if (error_stack[0]) {
    normal_error.script = normal_error.script || error_stack[0].script;
    normal_error.line = normal_error.line || error_stack[0].line;
    normal_error.column = normal_error.column || error_stack[0].column;
  }

  if (!normal_error.name && normal_error.message) {
    const message_start_index = normal_error.message.indexOf(':');
    if (message_start_index > 0) {
      normal_error.name = normal_error.message.substr(0, message_start_index);
      normal_error.message = normal_error.message
        .substr(message_start_index + 1)
        .trim();
    } else normal_error.name = normal_error.message;
  }

  if (
    typeof normal_error.message !== 'string' ||
    normal_error.messageWithParams.length
  )
    normal_error.message = String(normal_error.message);
  else {
    normal_error.messageWithParams = parse_error_string(normal_error.message);
    normal_error.message = eprintf.apply(
      window,
      normal_error.messageWithParams
    );
  }

  for (const key in normal_error)
    if (normal_error[key] == null) delete normal_error[key];

  return normal_error;
};

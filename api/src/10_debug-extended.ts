/// <reference path="index.d.ts" />

/**
 * @module debug-extended
 *
 * Dependencies:
 *  - debug (former 11, now node_module)
 */

import debug from 'debug';

exports = debug;

function load(): string {
  let is_debug: string;

  try {
    is_debug = exports.storage.debug;
  } catch {}
  if ('env' in (typeof process === 'undefined' ? {} : process))
    is_debug = process.env.DEBUG;

  return is_debug;
}

exports.log = function(): void {
  return (
    typeof console === 'object' &&
    console.log &&
    Function.prototype.apply.call(console.log, console, arguments)
  );
};

exports.formatArgs = function(...args: string[]) {
  const use_colors = this.useColors;
  args[0] =
    (use_colors ? '%c' : '') +
    this.namespace +
    (use_colors ? ' %c' : ' ') +
    args[0] +
    (use_colors ? '%c ' : ' ') +
    '+' +
    debug.humanize(this.diff);
  if (!use_colors) return args;

  const color_string = 'color: ' + this.color;
  let index = 0;
  let final_index = 0;

  args = [args[0], color_string, 'color: inherit'].concat(args.slice(1));

  args[0].replace(/%[a-z%]/g, (value: string) => {
    if (value !== '%%') {
      index++;
      if (value === '%c') final_index = index;
    }
    return undefined;
  });

  args.splice(final_index, 0, color_string);

  return args;
};

exports.save = function(value: any): void {
  try {
    if (value === null) exports.storage.removeItem('debug');
    else exports.storage.debug = value;
  } catch {}
};

exports.load = load;

exports.useColors = (): boolean =>
  (typeof document !== 'undefined' &&
    'WebkitAppearance' in document.documentElement.style) ||
  (window.console &&
    (console.firebug || (console.exception && console.table))) ||
  (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
    parseInt(RegExp.$1, 10) >= 31);

exports.storage = (typeof chrome !== 'undefined' && chrome.storage !== undefined
  ? chrome.storage.local
  : (() => {
      try {
        return window.localStorage;
      } catch {}
    })()) as Storage;

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
] as string[];

exports.formatters.j = function(value: any): string {
  return JSON.stringify(value);
};

debug.enable(load());

export default exports;

/// <reference path="index.d.ts" />

/**
 * @module debug-extended
 *
 * An extension to the `debug` module.
 *
 * Dependencies:
 *  - debug (former 11, now node_module)
 */

import debug from 'debug';

const debug_extended = debug as typeof debug & {
  formatArgs: (...args: string[]) => string[];
  save: (value: any) => void;
  useColors: () => boolean;
  storage: Storage;
  colors: string[];
  stringify: (value: any) => string;
};

export const load = (): string => {
  let is_debug: string;

  try {
    is_debug = debug_extended.storage.debug;
  } catch {}
  if ('env' in (process || {})) is_debug = process.env.DEBUG;

  return is_debug;
};

debug_extended.log = function(): void {
  return (
    typeof console === 'object' &&
    console.log &&
    Function.prototype.apply.call(console.log, console, arguments)
  );
};

debug_extended.formatArgs = (...args: string[]): string[] => {
  const use_colors = this.useColors;
  args[0] =
    (use_colors ? '%c' : '') +
    this.namespace +
    (use_colors ? ' %c' : ' ') +
    args[0] +
    (use_colors ? '%c ' : ' ') +
    '+' +
    debug_extended.humanize(this.diff);
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

debug_extended.save = function(value: any): void {
  try {
    if (value === null) debug_extended.storage.removeItem('debug');
    else debug_extended.storage.debug = value;
  } catch {}
};

debug_extended.useColors = (): boolean =>
  (document && 'WebkitAppearance' in document.documentElement.style) ||
  (window.console &&
    (console.firebug || (console.exception && console.table))) ||
  (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
    parseInt(RegExp.$1, 10) >= 31);

debug_extended.storage = (chrome && chrome.storage
  ? chrome.storage.local
  : (() => {
      try {
        return window.localStorage;
      } catch {}
    })()) as Storage;

debug_extended.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
] as string[];

debug_extended.stringify = (value: any) => JSON.stringify(value);

debug_extended.enable(load());

export default debug_extended;

/**
 * @module eprintf
 *
 * An implementation of printf.
 *
 * Dependencies:
 *  - none
 */

const eprintf = function(format: string, ...args: any[]): string {
  if (format.split('%s').length - 1 !== args.length)
    return eprintf('eprintf args number mismatch: %s', JSON.stringify(args));

  let args_index = 0;
  return format.replace(/%s/g, () => String(args[args_index++]));
};

export default eprintf;

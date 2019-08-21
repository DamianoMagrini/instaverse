/**
 * @module ex
 *
 * Generate an error string.
 *
 * Dependencies: none
 */

const ex = (...error_stack: string[]): string => {
  error_stack = error_stack.map((subroutine) => String(subroutine));

  if (error_stack[0].split('%s').length !== error_stack.length)
    return ex('ex args number mismatch: %s', JSON.stringify(error_stack));
  else return ex._prefix + JSON.stringify(error_stack) + ex._suffix;
};

ex._prefix = '<![EX[';
ex._suffix = ']]>';

export default ex;

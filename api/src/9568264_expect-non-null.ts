/**
 * @module expect-non-null
 *
 * Throws an error if the value that was passed in is null.
 *
 * Dependencies: none
 */

export default <T>(value: T): T => {
  if (value !== null) return value;
  const error: Error & { framesToPop?: number } = new Error(
    'Got unexpected null or undefined'
  );
  error.framesToPop = 1;
  throw (error.framesToPop, error);
};

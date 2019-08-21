/**
 * @module throw-error-async
 */

export default (promise: Promise<any>) =>
  promise.catch(
    (error: any) => (
      setTimeout(() => {
        throw error;
      }, 0),
      promise
    )
  );

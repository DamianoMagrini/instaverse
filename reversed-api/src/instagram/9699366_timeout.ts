export default <Args extends Array<any>>(
  handler: (...args: Args) => void,
  timeout?: number,
  ...args: Args
): number => setTimeout(handler, timeout, ...args);

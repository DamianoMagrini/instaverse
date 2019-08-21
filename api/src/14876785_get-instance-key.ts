/**
 * @module get-instance-key
 *
 * Returns the numerical instance key from a string ID.
 *
 * Dependencies: none
 */

const imul = (x: number, y: number) =>
  'imul' in Math && typeof Math.imul === 'function'
    ? Math.imul(x, y)
    : (x * y) | 0;

export default (id: string) => {
  let key = 0;

  for (let index = 0; index < id.length; index++)
    key = (imul(31, key) + id.charCodeAt(index)) | 0;

  return key;
};

/**
 * @module is-not-null
 *
 * Determines if an value is not `null`.
 *
 * Dependencies: none
 */

const is_not_null = (value: any) => value !== null && typeof value === 'object';

export default is_not_null;

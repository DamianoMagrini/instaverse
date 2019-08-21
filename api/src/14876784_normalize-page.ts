/**
 * @module normalize-page
 *
 * Normalize a page object.
 *
 * Dependencies: none
 */

const normalize_page = (page: {
  has_next_page: boolean;
  end_cursor: string;
}) => ({
  hasNextPage: page.has_next_page,
  hasPreviousPage: undefined,
  endCursor:
    page.end_cursor !== null &&
    page.end_cursor !== '' &&
    page.end_cursor !== '0'
      ? page.end_cursor
      : null,
  startCursor: null
});

export default normalize_page;

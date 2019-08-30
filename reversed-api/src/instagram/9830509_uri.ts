/**
 * @module uri
 *
 * A class for creating URIs
 *
 * Dependencies:
 *  - query-serializer (14680200)
 *  - uri-base (14942220)
 */

import query_serializer from './14680200_query-serializer';
import URIBase from './14942220_uri-base';

export default class URI extends URIBase {
  static isValidURI(uri_string: string) {
    return URIBase.isValidURI(uri_string, query_serializer);
  }

  constructor(uri_string: string) {
    super(uri_string, query_serializer);
  }
};

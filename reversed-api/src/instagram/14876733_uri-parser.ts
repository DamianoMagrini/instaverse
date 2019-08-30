/**
 * @module uri-parser
 * 
 * A function to parse URI strings.
 * 
 * Dependencies: none
 */

export interface ParsedURI {
  uri: string;
  scheme: string;
  authority: string;
  userinfo: string;
  host: string;
  port: number;
  path: string;
  query: string;
  fragment: string;
  isGenericURI: boolean;
}

const MATCH_URI_PARTS = new RegExp(
  '^([^:/?#]+:)?(//([^\\\\/?#@]*@)?(\\[[A-Fa-f0-9:.]+\\]|[^\\/?#:]*)(:[0-9]*)?)?([^?#]*)(\\?[^#]*)?(#.*)?'
);

export const parse = (uri: string): ParsedURI => {
  if (uri.trim() === '') return null;

  const parts = uri.match(MATCH_URI_PARTS);
  const parsed_uri: ParsedURI = {
    uri: parts[0] ? parts[0] : null,
    scheme: parts[1] ? parts[1].substr(0, parts[1].length - 1) : null,
    authority: parts[2] ? parts[2].substr(2) : null,
    userinfo: parts[3] ? parts[3].substr(0, parts[3].length - 1) : null,
    host: parts[2] ? parts[4] : null,
    port:
      parts[5] && parts[5].substr(1) ? parseInt(parts[5].substr(1), 10) : null,
    path: parts[6] ? parts[6] : null,
    query: parts[7] ? parts[7].substr(1) : null,
    fragment: parts[8] ? parts[8].substr(1) : null,
    isGenericURI: null as boolean
  };

  parsed_uri.isGenericURI =
    parsed_uri.authority === null && !!parsed_uri.scheme;

  return parsed_uri;
};

/**
 * @module get-props-from-server
 *
 * Retrieve a route's props from the server.
 *
 * Dependencies:
 *  - path-props (9830606)
 *  - http (9568364)
 */

import * as path_props from './9830606_path-props';
import * as http from './9568364_http';

import { ExtendedResponse } from 'qwest';

const get_props_from_server = async (
  url: string,
  callback: (error: Error, arg?: ExtendedResponse) => any,
  options?: path_props.GetPropsOptions & {
    numRetries?: number;
  }
) => {
  options = options || { numRetries: 0 };

  const pathname = url
    .split('?')[0]
    .replace(/([/])?$/, (match, slash) => (slash ? match : '/'));

  const pathname_props = await path_props.getPropsForPathname(
    pathname,
    callback,
    options
  );

  return pathname_props !== undefined
    ? pathname_props
    : http
        .get(url, { __a: 1 })
        .then(
          (response) => {
            if (response !== null)
              return (
                path_props.updatePropsForPathname(
                  pathname,
                  response,
                  callback
                ) || {}
              );
            const { numRetries } = options;
            if (numRetries > 0)
              return get_props_from_server(url, callback, {
                ...options,
                numRetries: numRetries - 1
              });

            const error = new Error('Malformed response!');
            callback(error);
            throw error;
          },
          (error) => {
            const { numRetries } = options;
            if (numRetries > 0)
              return get_props_from_server(url, callback, {
                ...options,
                numRetries: numRetries - 1
              });
            callback(error);
            throw error;
          }
        )
        .catch((error) =>
          path_props
            .getPropsForPathname(pathname, callback, {
              allowStale: true,
              onCached: options.onCached
            })
            .then((props) => {
              if (props !== null) return props;
              throw error;
            })
        );
};

export default get_props_from_server;

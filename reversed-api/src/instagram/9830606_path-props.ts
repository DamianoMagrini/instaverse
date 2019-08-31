/**
 * @module path-props
 *
 * Gets and sets props for routes.
 *
 * Dependencies:
 *  - shared-data (9961575)
 */

import * as shared_data from './9961575_shared-data';

interface Path {
  value: any;
  timestamp: number;
  invalidated: boolean;
}

export interface GetPropsOptions {
  allowStale?: boolean;
  allowEarlyFlushData?: boolean;
  onCached?: (path: Path) => void;
}

const paths: {
  [pathname: string]: Path;
} = {};
const path_props: {
  [pathname: string]: Path;
} = {};

// ? Is !! really necessary? After all, path.invalidated should always be bool.
const invalidated = (path: Path) => !!path.invalidated;

export const getPropsForPathname = async (
  pathname: string,
  callback: (error: Error, data: any) => void,
  options?: GetPropsOptions
) => {
  const { allowStale, allowEarlyFlushData, onCached } = {
    allowStale: false,
    allowEarlyFlushData: false,
    ...options
  };

  let additional_data = null;

  if (allowEarlyFlushData && shared_data.hasAdditionalData(pathname)) {
    const data = await shared_data.additionalDataQueryReady(pathname);
    if (data.status === 'ok') additional_data = data;
  }

  const props = path_props[pathname];

  if (additional_data || props) {
    paths[pathname] = {
      // ! =================================================== ! //
      // ! THIS DOES NOT WORK IF ADDITIONAL_DATA.DATA IS FALSE ! //
      // ! =================================================== ! //
      value: callback(
        null,
        (additional_data && additional_data.data) || props.value
      ),
      timestamp: props && props.timestamp ? props.timestamp : Date.now(),
      invalidated: false
    };

    delete path_props[pathname];
  }

  const path = paths[pathname];

  if (path && (allowStale || !invalidated(path))) {
    if (additional_data === null && props === null && onCached) onCached(path);
    return path.value;
  }
};

export const getInitialDataForPathname = (pathname: string) => {
  if (path_props[pathname]) return path_props[pathname].value;
};

export const setInitialDataForPathname = (data: any, pathname: string) => {
  path_props[pathname] = {
    value: data,
    timestamp: Date.now(),
    invalidated: false
  };
};

export const updatePropsForPathname = <ValueType, ArgType>(
  pathname: string,
  arg: ArgType,
  get_value: (error: Error, arg: ArgType) => ValueType
): ValueType => {
  const value = get_value(null, arg);
  paths[pathname] = { value, timestamp: Date.now(), invalidated: false };
  return value;
};

export const invalidatePath = (pathname: string) => {
  const path = paths[pathname];
  if (path)
    paths[pathname] = {
      value: path.value,
      timestamp: path.timestamp,
      invalidated: true
    };
};

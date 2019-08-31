import https from 'https';

import { stringify_cookies } from './http_data/stringify_data';
import parse_set_cookies from './http_data/parse_set_cookies';

export interface RequestCookies {
  ig_cb: 1;
  mid: string;
  csrftoken: string;
}

export let cached_request_cookies: RequestCookies = null;

const get_request_cookies_from_server = () =>
  new Promise<void>((resolve, reject) => {
    const REQUEST_OPTIONS = {
      method: 'GET',

      hostname: 'www.instagram.com',
      path: '/web/__mid/',

      headers: {
        cookie: stringify_cookies({ ig_cb: 1 })
      }
    };

    const request = https.request(REQUEST_OPTIONS, (response) => {
      const { ig_cb, mid, csrftoken } = parse_set_cookies<RequestCookies>(
        response
      );

      cached_request_cookies = { ig_cb, mid, csrftoken };
      resolve();
    });

    request.on('error', reject);

    request.end();
  });

const get_request_cookies = async (): Promise<RequestCookies> => {
  if (!cached_request_cookies) await get_request_cookies_from_server();
  return cached_request_cookies;
};

export default get_request_cookies;

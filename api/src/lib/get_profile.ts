import https from 'https';

import { stringify_query, stringify_cookies } from './http_data/stringify_data';

import get_request_cookies, {
  RequestCookies,
  cached_request_cookies
} from './get_request_cookies';
import { LoginCookies } from './login';

import { ProfileResponse } from './profile';

const get_profile = (
  profile: string,
  cookies: {
    login?: LoginCookies;
    request?: RequestCookies;
  }
) =>
  new Promise<ProfileResponse>(async (resolve, reject) => {
    const request_cookies =
      cookies.request ||
      cached_request_cookies ||
      (await get_request_cookies());

    const COOKIE = stringify_cookies({
      ...request_cookies,
      ...(cookies.login || {})
    });

    const REQUEST_OPTIONS = {
      method: 'GET',

      hostname: 'www.instagram.com',
      path: `/${profile}/?${stringify_query({ __a: 1 })}`,

      headers: {
        accept: '*/*',
        'accept-encoding': 'identity',
        cookie: COOKIE
      }
    };

    const request = https.request(REQUEST_OPTIONS, (response) => {
      let response_data = '';
      response.on('data', (data) => {
        response_data += data;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(response_data) as ProfileResponse);
        } catch (error) {
          reject(error);
        }
      });

      return;
    });

    request.on('error', reject);

    request.end();
  });

export default get_profile;

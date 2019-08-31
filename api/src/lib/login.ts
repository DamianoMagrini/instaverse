import https from 'https';

import { stringify_query, stringify_cookies } from './http_data/stringify_data';
import parse_set_cookies from './http_data/parse_set_cookies';

import get_request_cookies, {
  RequestCookies,
  cached_request_cookies
} from './get_request_cookies';

export interface LoginData {
  authenticated: boolean;
  user: boolean;
  userId: string;
  loginNonce: string;
  profilePictureUrl: string;
  status: string;
}

export interface LoginCookies {
  ds_user_id: number;
  sessionid: string;
}

const login = (
  credentials: { username: string; password: string },
  request_cookies?: RequestCookies
) =>
  new Promise<[LoginCookies, LoginData]>(async (resolve, reject) => {
    request_cookies =
      request_cookies ||
      cached_request_cookies ||
      (await get_request_cookies());

    const POST_DATA = stringify_query({
      ...credentials,
      queryParams: JSON.stringify({
        source: 'auth_switcher',
        oneTapUsers: JSON.stringify(['17377208337'])
      }),
      optIntoOneTap: true
    });

    const COOKIE = stringify_cookies(request_cookies);

    const OPTIONS = {
      method: 'POST',

      hostname: 'www.instagram.com',
      path: '/accounts/login/ajax/',

      headers: {
        accept: '*/*',
        'accept-encoding': 'identity', // lame...
        'content-length': POST_DATA.length,
        'content-type': 'application/x-www-form-urlencoded',
        cookie: COOKIE,
        'x-csrftoken': request_cookies.csrftoken
      }
    };

    const request = https.request(OPTIONS, (response) => {
      const login_response = [];

      const { ds_user_id, sessionid } = parse_set_cookies<LoginCookies>(
        response
      );

      const login_cookies: LoginCookies = { ds_user_id, sessionid };

      let raw_login_data = '';
      response.on('data', (data) => {
        raw_login_data += data;
      });
      response.on('end', () => {
        try {
          const login_data = JSON.parse(raw_login_data) as LoginData;
          resolve([login_cookies, login_data]);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);

    request.write(POST_DATA);
    request.end();
  });

export default login;

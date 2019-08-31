import { IncomingMessage } from 'http';

const parse_set_cookies = <T>(response: IncomingMessage) =>
  response.headers['set-cookie']
    .map((cookie) => cookie.split(';')[0].split('='))
    .reduce(
      (accumulator, cookie_tuple) => ({
        ...accumulator,
        [cookie_tuple[0]]: cookie_tuple[1]
      }),
      {} as T & { [name: string]: any }
    );

export default parse_set_cookies;

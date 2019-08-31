const stringify_query = (query: { [key: string]: any }) =>
  Object.keys(query)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
    )
    .join('&');

const stringify_cookies = (cookies: { [key: string]: any }) =>
  Object.keys(cookies)
    .map((key) => `${key}=${cookies[key]}`)
    .join('; ');

export { stringify_query, stringify_cookies };

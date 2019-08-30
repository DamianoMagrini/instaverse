function is_not_disallowed_protocol(protocol: string) {
  return !/^(GET|HEAD|OPTIONS|TRACE)$/.test(protocol);
}

function is_same_domain(url: string) {
  if (!/^(\/\/|http:|https:).*/.test(url)) return true;

  if (
    !(
      document &&
      document.location &&
      document.location.host &&
      document.location.protocol
    )
  )
    return false;

  const current_path = '//' + document.location.host;
  const current_url = document.location.protocol + current_path;

  return (
    url === current_url ||
    url.slice(0, current_url.length + 1) === current_url + '/' ||
    url === current_path ||
    url.slice(0, current_path.length + 1) === current_path + '/'
  );
}

const validate_http_request = (protocol: string, url: string) => {
  return is_not_disallowed_protocol(protocol) && is_same_domain(url);
};

export default validate_http_request;

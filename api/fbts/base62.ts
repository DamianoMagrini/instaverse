const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function base62(number: number): string {
  if (!number) {
    return '0';
  }

  let string = '';

  while (number > 0) {
    string = BASE62[number % 62] + string;
    number = Math.floor(number / 62);
  }

  return string;
}

export default base62;

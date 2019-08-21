import UnicodeUtils from './UnicodeUtils';

/**
 * @param {number} codePoint  Valid Unicode code-point
 * @param {number} len        Zero-padded minimum width of result
 * @return {string}           A zero-padded hexadecimal string (00XXXX)
 */
function zeroPaddedHex(codePoint: number, len: number): string {
  let codePointHex = codePoint.toString(16).toUpperCase();
  let numZeros = Math.max(0, len - codePointHex.length);
  var result = '';

  for (var i = 0; i < numZeros; i++) {
    result += '0';
  }

  result += codePointHex;
  return result;
}

/**
 * @param {number} codePoint  Valid Unicode code-point
 * @return {string}           A formatted Unicode code-point string
 *                            of the format U+XXXX, U+XXXXX, or U+XXXXXX
 */
function formatCodePoint(codePoint: number): string {
  codePoint = codePoint || 0; // NaN --> 0

  var formatted = '';

  if (codePoint <= 0xffff) {
    formatted = zeroPaddedHex(codePoint, 4);
  } else {
    formatted = codePoint.toString(16).toUpperCase();
  }

  return 'U+' + formatted;
}

/**
 * Get a list of formatted (string) Unicode code-points from a String
 *
 * @param {string} str        Valid Unicode string
 * @return {array<string>}    A list of formatted code-point strings
 */
function getCodePointsFormatted(str: string): Array<string> {
  const codePoints = UnicodeUtils.getCodePoints(str);
  return codePoints.map(formatCodePoint);
}

const specialEscape = {
  0x07: '\\a',
  0x08: '\\b',
  0x0c: '\\f',
  0x0a: '\\n',
  0x0d: '\\r',
  0x09: '\\t',
  0x0b: '\\v',
  0x22: '\\"',
  0x5c: '\\\\'
};

/**
 * Returns a double-quoted PHP string with all non-printable and
 * non-US-ASCII sequences escaped.
 *
 * @param {string} str Valid Unicode string
 * @return {string}    Double-quoted string with Unicode sequences escaped
 */
function phpEscape(s): string {
  var result = '"';

  for (let cp of UnicodeUtils.getCodePoints(s)) {
    let special = specialEscape[cp];

    if (special !== undefined) {
      result += special;
    } else if (cp >= 0x20 && cp <= 0x7e) {
      result += String.fromCodePoint(cp);
    } else if (cp <= 0xffff) {
      result += '\\u{' + zeroPaddedHex(cp, 4) + '}';
    } else {
      result += '\\u{' + zeroPaddedHex(cp, 6) + '}';
    }
  }

  result += '"';
  return result;
}

/**
 * Returns a double-quoted Java or JavaScript string with all
 * non-printable and non-US-ASCII sequences escaped.
 *
 * @param {string} str Valid Unicode string
 * @return {string}    Double-quoted string with Unicode sequences escaped
 */
function jsEscape(s): string {
  var result = '"';

  for (var i = 0; i < s.length; i++) {
    let cp = s.charCodeAt(i);
    let special = specialEscape[cp];

    if (special !== undefined) {
      result += special;
    } else if (cp >= 0x20 && cp <= 0x7e) {
      result += String.fromCodePoint(cp);
    } else {
      result += '\\u' + zeroPaddedHex(cp, 4);
    }
  }

  result += '"';
  return result;
}

function c11Escape(s) {
  var result = '';

  for (let cp of UnicodeUtils.getCodePoints(s)) {
    let special = specialEscape[cp];

    if (special !== undefined) {
      result += special;
    } else if (cp >= 0x20 && cp <= 0x7e) {
      result += String.fromCodePoint(cp);
    } else if (cp <= 0xffff) {
      result += '\\u' + zeroPaddedHex(cp, 4);
    } else {
      result += '\\U' + zeroPaddedHex(cp, 8);
    }
  }

  return result;
}

/**
 * Returns a double-quoted C string with all non-printable and
 * non-US-ASCII sequences escaped.
 *
 * @param {string} str Valid Unicode string
 * @return {string}    Double-quoted string with Unicode sequences escaped
 */
function cEscape(s): string {
  return 'u8"' + c11Escape(s) + '"';
}

/**
 * Returns a double-quoted Objective-C string with all non-printable
 * and non-US-ASCII sequences escaped.
 *
 * @param {string} str Valid Unicode string
 * @return {string}    Double-quoted string with Unicode sequences escaped
 */
function objcEscape(s): string {
  return '@"' + c11Escape(s) + '"';
}

/**
 * Returns a double-quoted Python string with all non-printable
 * and non-US-ASCII sequences escaped.
 *
 * @param {string} str Valid Unicode string
 * @return {string}    Double-quoted string with Unicode sequences escaped
 */
function pyEscape(s): string {
  return 'u"' + c11Escape(s) + '"';
}

const UnicodeUtilsExtra = {
  formatCodePoint: formatCodePoint,
  getCodePointsFormatted: getCodePointsFormatted,
  zeroPaddedHex: zeroPaddedHex,
  phpEscape: phpEscape,
  jsEscape: jsEscape,
  cEscape: cEscape,
  objcEscape: objcEscape,
  pyEscape: pyEscape
};
export default UnicodeUtilsExtra;

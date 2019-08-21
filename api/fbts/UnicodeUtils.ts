import invariant from './invariant';

// These two ranges are consecutive so anything in [HIGH_START, LOW_END] is a
// surrogate code unit.
const SURROGATE_HIGH_START = 0xd800;
const SURROGATE_HIGH_END = 0xdbff;
const SURROGATE_LOW_START = 0xdc00;
const SURROGATE_LOW_END = 0xdfff;
const SURROGATE_UNITS_REGEX = /[\uD800-\uDFFF]/;

/**
 * @param codeUnit   A Unicode code-unit, in range [0, 0x10FFFF]
 * @return          Whether code-unit is in a surrogate (hi/low) range
 */
function isCodeUnitInSurrogateRange(codeUnit: number): boolean {
  return SURROGATE_HIGH_START <= codeUnit && codeUnit <= SURROGATE_LOW_END;
}

/**
 * Returns whether the two characters starting at `index` form a surrogate pair.
 * For example, given the string s = "\uD83D\uDE0A", (s, 0) returns true and
 * (s, 1) returns false.
 */
function isSurrogatePair(str: string, index: number): boolean {
  invariant(
    0 <= index && index < str.length,
    'isSurrogatePair: Invalid index %s for string length %s.',
    index,
    str.length
  );

  if (index + 1 === str.length) {
    return false;
  }

  const first = str.charCodeAt(index);
  const second = str.charCodeAt(index + 1);
  return (
    SURROGATE_HIGH_START <= first &&
    first <= SURROGATE_HIGH_END &&
    SURROGATE_LOW_START <= second &&
    second <= SURROGATE_LOW_END
  );
}

/**
 * @param {string} str  Non-empty string
 * @return {boolean}    True if the input includes any surrogate code units
 */
function hasSurrogateUnit(str: string): boolean {
  return SURROGATE_UNITS_REGEX.test(str);
}

/**
 * Return the length of the original Unicode character at given position in the
 * String by looking into the UTF-16 code unit; that is equal to 1 for any
 * non-surrogate characters in BMP ([U+0000..U+D7FF] and [U+E000, U+FFFF]); and
 * returns 2 for the hi/low surrogates ([U+D800..U+DFFF]), which are in fact
 * representing non-BMP characters ([U+10000..U+10FFFF]).
 *
 * Examples:
 * - '\u0020' => 1
 * - '\u3020' => 1
 * - '\uD835' => 2
 * - '\uD835\uDDEF' => 2
 * - '\uDDEF' => 2
 *
 * @param str  Non-empty string
 * @param pos  Position in the string to look for one code unit
 * @return     Number 1 or 2
 */
function getUTF16Length(str: string, pos: number): 1 | 2 {
  return (1 + Number(isCodeUnitInSurrogateRange(str.charCodeAt(pos)))) as 1 | 2;
}

/**
 * Fully Unicode-enabled replacement for String#length
 *
 * @param  str  Valid Unicode string
 * @return      The number of Unicode characters in the string
 */
function strlen(str: string) {
  // Call the native functions if there's no surrogate char
  if (!hasSurrogateUnit(str)) {
    return str.length;
  }

  let len = 0;

  for (let pos = 0; pos < str.length; pos += getUTF16Length(str, pos)) {
    len++;
  }

  return len;
}

/**
 * Fully Unicode-enabled replacement for String#substr()
 *
 * @param str     Valid Unicode string
 * @param start   Location in Unicode sequence to begin extracting
 * @param length  The number of Unicode characters to extract
 *                (default: to the end of the string)
 * @return        Extracted sub-string
 */
function substr(str: string, start: number, length?: number): string {
  start = start || 0;
  length = length === undefined ? Infinity : length || 0; // Call the native functions if there's no surrogate char

  if (!hasSurrogateUnit(str)) {
    return str.substr(start, length);
  } // Obvious cases

  const size = str.length;

  if (size <= 0 || start > size || length <= 0) {
    return '';
  } // Find the actual starting position

  let posA = 0;

  if (start > 0) {
    for (; start > 0 && posA < size; start--) {
      posA += getUTF16Length(str, posA);
    }

    if (posA >= size) {
      return '';
    }
  } else if (start < 0) {
    for (posA = size; start < 0 && 0 < posA; start++) {
      posA -= getUTF16Length(str, posA - 1);
    }

    if (posA < 0) {
      posA = 0;
    }
  } // Find the actual ending position

  let posB = size;

  if (length < size) {
    for (posB = posA; length > 0 && posB < size; length--) {
      posB += getUTF16Length(str, posB);
    }
  }

  return str.substring(posA, posB);
}

/**
 * Fully Unicode-enabled replacement for String#substring()
 *
 * @param {string} str    Valid Unicode string
 * @param {number} start  Location in Unicode sequence to begin extracting
 * @param {?number} end   Location in Unicode sequence to end extracting
 *                        (default: end of the string)
 * @return {string}       Extracted sub-string
 */
function substring(str: string, start: number, end?: number): string {
  start = start || 0;
  end = end === undefined ? Infinity : end || 0;

  if (start < 0) {
    start = 0;
  }

  if (end < 0) {
    end = 0;
  }

  const length = Math.abs(end - start);
  start = start < end ? start : end;
  return substr(str, start, length);
}

/**
 * Get a list of Unicode code-points from a String
 *
 * @param {string} str        Valid Unicode string
 * @return {array<number>}    A list of code-points in [0..0x10FFFF]
 */
function getCodePoints(str: string): Array<number> {
  const codePoints = [];

  for (let pos = 0; pos < str.length; pos += getUTF16Length(str, pos)) {
    codePoints.push(str.codePointAt(pos));
  }

  return codePoints;
}

const UnicodeUtils = {
  getCodePoints: getCodePoints,
  getUTF16Length: getUTF16Length,
  hasSurrogateUnit: hasSurrogateUnit,
  isCodeUnitInSurrogateRange: isCodeUnitInSurrogateRange,
  isSurrogatePair: isSurrogatePair,
  strlen: strlen,
  substring: substring,
  substr: substr
};
export default UnicodeUtils;

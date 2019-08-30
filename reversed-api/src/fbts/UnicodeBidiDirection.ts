import invariant from './invariant';

export type BidiDirection = 'LTR' | 'RTL' | 'NEUTRAL';
export type HTMLDir = 'ltr' | 'rtl';

const NEUTRAL: BidiDirection = 'NEUTRAL'; // No strong direction
const LTR: BidiDirection = 'LTR'; // Left-to-Right direction
const RTL: BidiDirection = 'RTL'; // Right-to-Left direction

let globalDir: BidiDirection | null = null; // == Helpers ==

/**
 * Check if a directionality value is a Strong one
 */
function isStrong(dir: BidiDirection): boolean {
  return dir === LTR || dir === RTL;
}

/**
 * Get string value to be used for `dir` HTML attribute or `direction` CSS
 * property.
 */
function getHTMLDir(dir: BidiDirection): HTMLDir {
  invariant(
    isStrong(dir),
    '`dir` must be a strong direction to be converted to HTML Direction'
  );
  return dir === LTR ? 'ltr' : 'rtl';
}

/**
 * Get string value to be used for `dir` HTML attribute or `direction` CSS
 * property, but returns null if `dir` has same value as `otherDir`.
 * `null`.
 */
function getHTMLDirIfDifferent(
  dir: BidiDirection,
  otherDir: BidiDirection
): HTMLDir | null {
  invariant(
    isStrong(dir),
    '`dir` must be a strong direction to be converted to HTML Direction'
  );
  invariant(
    isStrong(otherDir),
    '`otherDir` must be a strong direction to be converted to HTML Direction'
  );
  return dir === otherDir ? null : getHTMLDir(dir);
} // == Global Direction ==

/**
 * Set the global direction.
 */
function setGlobalDir(dir: BidiDirection): void {
  globalDir = dir;
}

/**
 * Initialize the global direction
 */
function initGlobalDir(): void {
  setGlobalDir(LTR);
}

/**
 * Get the global direction
 */
function getGlobalDir(): BidiDirection {
  if (!globalDir) {
    this.initGlobalDir();
  }

  invariant(globalDir, 'Global direction not set.');
  return globalDir;
}

const UnicodeBidiDirection = {
  // Values
  NEUTRAL,
  LTR,
  RTL,
  // Helpers
  isStrong,
  getHTMLDir,
  getHTMLDirIfDifferent,
  // Global Direction
  setGlobalDir,
  initGlobalDir,
  getGlobalDir
};

export default UnicodeBidiDirection;

import UnicodeBidi from './UnicodeBidi';

import UnicodeBidiDirection, { BidiDirection } from './UnicodeBidiDirection';

import invariant from './invariant';

class UnicodeBidiService {
  _defaultDir: BidiDirection;
  _lastDir: BidiDirection;

  /**
   * Stateful class for paragraph direction detection
   *
   * @param defaultDir  Default direction of the service
   */
  constructor(defaultDir: BidiDirection | null) {
    if (!defaultDir) {
      defaultDir = UnicodeBidiDirection.getGlobalDir();
    } else {
      invariant(
        UnicodeBidiDirection.isStrong(defaultDir),
        'Default direction must be a strong direction (LTR or RTL)'
      );
    }

    this._defaultDir = defaultDir;
    this.reset();
  }

  /**
   * Reset the internal state
   *
   * Instead of creating a new instance, you can just reset() your instance
   * everytime you start a new loop.
   */
  reset(): void {
    this._lastDir = this._defaultDir;
  }

  /**
   * Returns the direction of a block of text, and remembers it as the
   * fall-back direction for the next paragraph.
   *
   * @param str  A text block, e.g. paragraph, table cell, tag
   * @return     The resolved direction
   */
  getDirection(str: string): BidiDirection {
    this._lastDir = UnicodeBidi.getDirection(str, this._lastDir);
    return this._lastDir;
  }
}

export default UnicodeBidiService;

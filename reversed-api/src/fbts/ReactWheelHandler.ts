import emptyFunction from './emptyFunction';

import normalizeWheel from './normalizeWheel';

import requestAnimationFramePolyfill from './requestAnimationFramePolyfill';

class ReactWheelHandler {
  _animationFrameID: number = null;
  _deltaX = 0;
  _deltaY = 0;

  _onWheelCallback: (deltaX: number, deltaY: number) => void;

  _handleScrollX: (deltaX: number, deltaY: number) => boolean;
  _handleScrollY: (deltaX: number, deltaY: number) => boolean;
  _stopPropagation: () => boolean;

  /**
   * onWheel is the callback that will be called with right frame rate if
   * any wheel events happened
   * onWheel should is to be called with two arguments: deltaX and deltaY in
   * this order
   */
  constructor(
    onWheel: (deltaX: number, deltaY: number) => void,
    handleScrollX: boolean | { (deltaX: number, deltaY: number): boolean },
    handleScrollY: boolean | { (deltaX: number, deltaY: number): boolean },
    stopPropagation?: boolean | { (): boolean }
  ) {
    this._onWheelCallback = onWheel;

    if (typeof handleScrollX !== 'function')
      handleScrollX = handleScrollX
        ? emptyFunction.thatReturnsTrue
        : emptyFunction.thatReturnsFalse;
    else this._handleScrollX = handleScrollX;

    if (typeof handleScrollY !== 'function')
      handleScrollY = handleScrollY
        ? emptyFunction.thatReturnsTrue
        : emptyFunction.thatReturnsFalse;
    else this._handleScrollY = handleScrollY;

    if (typeof stopPropagation !== 'function')
      this._stopPropagation = stopPropagation
        ? emptyFunction.thatReturnsTrue
        : emptyFunction.thatReturnsFalse;
    else this._stopPropagation = stopPropagation;
  }

  onWheel = (event: {
    [key: string]: any;
    preventDefault?: () => void;
    stopPropagation?: () => void;
  }) => {
    const normalizedEvent = normalizeWheel(event);
    const deltaX = this._deltaX + normalizedEvent.pixelX;
    const deltaY = this._deltaY + normalizedEvent.pixelY;

    const handleScrollX = this._handleScrollX(deltaX, deltaY);

    const handleScrollY = this._handleScrollY(deltaY, deltaX);

    if (!handleScrollX && !handleScrollY) {
      return;
    }

    this._deltaX += handleScrollX ? normalizedEvent.pixelX : 0;
    this._deltaY += handleScrollY ? normalizedEvent.pixelY : 0;
    event.preventDefault();

    let changed: boolean;
    if (this._deltaX !== 0 || this._deltaY !== 0) {
      if (this._stopPropagation()) {
        event.stopPropagation();
      }

      changed = true;
    }

    if (changed === true && this._animationFrameID === null) {
      this._animationFrameID = requestAnimationFramePolyfill(this._didWheel);
    }
  };

  _didWheel = () => {
    this._animationFrameID = null;

    this._onWheelCallback(this._deltaX, this._deltaY);

    this._deltaX = 0;
    this._deltaY = 0;
  };
}

export default ReactWheelHandler;

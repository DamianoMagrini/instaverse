/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule CircularBuffer
 */
import invariant from './invariant';

class CircularBuffer {
  _size: number;
  _head: number;
  _buffer: any[];

  constructor(size: number) {
    invariant(size > 0, 'Buffer size should be a positive integer');
    this._size = size;
    this._head = 0;
    this._buffer = [];
  }

  write(entry: any) {
    if (this._buffer.length < this._size) {
      this._buffer.push(entry);
    } else {
      this._buffer[this._head] = entry;
      this._head++;
      this._head %= this._size;
    }

    return this;
  }

  read() {
    return this._buffer
      .slice(this._head)
      .concat(this._buffer.slice(0, this._head));
  }

  clear() {
    this._head = 0;
    this._buffer = [];
    return this;
  }
}

export default CircularBuffer;

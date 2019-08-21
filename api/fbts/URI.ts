class URI {
  _uri: string;

  constructor(uri: string) {
    this._uri = uri;
  }

  toString(): string {
    return this._uri;
  }
}

export default URI;

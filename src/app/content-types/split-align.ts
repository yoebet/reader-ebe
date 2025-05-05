import {DomSanitizer} from '@angular/platform-browser';

let tid = 0;

export class Row {
  static sanitizer: DomSanitizer;
  _left = '';
  _right = '';
  _sanitizedLeft;
  _sanitizedRight;
  fix = false;
  trackId: number;

  constructor() {
    this.trackId = tid++;
  }

  get left() {
    return this._left;
  }

  get right() {
    return this._right;
  }

  set left(l: string) {
    this._left = l;
    this._sanitizedLeft = null;
  }

  set right(r: string) {
    this._right = r;
    this._sanitizedRight = null;
  }

  get sanitizedLeft() {
    if (!this._sanitizedLeft) {
      this._sanitizedLeft = Row.sanitizer.bypassSecurityTrustHtml(this._left);
    }
    return this._sanitizedLeft;
  }

  get sanitizedRight() {
    if (!this._sanitizedRight) {
      this._sanitizedRight = Row.sanitizer.bypassSecurityTrustHtml(this._right);
    }
    return this._sanitizedRight;
  }
}

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'wanUnit'})
export class WanUnitNumPipe implements PipeTransform {
  transform(size: number): string {
    if (isNaN(size)) {
      return '?';
    }
    if (size < 10000) {
      return '' + size;
    }
    size = size / 10000;
    return `${size.toFixed(size > 10 ? 1 : 2)}万`;
  }
}

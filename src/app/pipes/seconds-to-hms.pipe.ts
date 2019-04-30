import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'hms'})
export class SecondsToHmsPipe implements PipeTransform {
  transform(seconds: number): string {
    if (isNaN(seconds)) {
      return '';
    }
    if (seconds < 60) {
      return seconds + 's';
    }
    let minutes = seconds / 60;
    if (minutes < 60) {
      return `${minutes.toFixed(1)}m`;
    }
    let hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  }
}

import * as moment from 'moment';

export class Model {
  _id: string;
  updatedAt?: string;


  static sequenceNo(_id: string, bytes: number = 3): number {
    if (!_id) {
      return parseInt('' + (1 << bytes * 8) * Math.random());
    }
    let hexChars = bytes * 2;
    return parseInt(_id.substr(_id.length - hexChars, hexChars), 16);
  }

  static timestampOfObjectId(_id: string): Date {
    if (!_id) {
      return null;
    }
    let seconds = parseInt(_id.substr(0, 8), 16);
    return new Date(seconds * 1000);
  }

  static createdTimeString(model: Model, precise: string = 'date'): string {
    if (!model) {
      return '';
    }
    let createdAt = Model.timestampOfObjectId(model._id);
    return Model.timeString(createdAt, precise);
  }

  static updatedTimeString(model: Model, precise: string = 'date'): string {
    if (!model) {
      return '';
    }
    return Model.timeString(model.updatedAt, precise);
  }

  static timeString(date: Date | string, precise: string = 'date'): string {
    if (!date) {
      return '';
    }
    let format = 'YYYY-M-D';
    if (precise === 'minute' || precise === 'time') {
      format += ' kk:mm';
    } else if (precise === 'second') {
      format += ' kk:mm:ss';
    }
    let dz = moment(date);
    // dz.utcOffset(8);
    return dz.format(format);
  }

}

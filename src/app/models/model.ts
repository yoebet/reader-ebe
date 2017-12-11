import * as moment from 'moment';

export class Model {
  _id: string;
  updatedAt?: string;


  static TimestampOfObjectId(_id: string) {
    if (!_id) {
      return null;
    }
    let seconds = parseInt(_id.substr(0, 8), 16);
    return new Date(seconds * 1000);
  }

  static CreatedAtString(model: Model) {
    if (!model) {
      return '';
    }
    let dateCreatedAt = Model.TimestampOfObjectId(model._id);
    return Model.TimestampString(dateCreatedAt);
  }

  static UpdatedAtString(model: Model) {
    if (!model) {
      return '';
    }
    return Model.TimestampString(model.updatedAt);
  }

  static TimestampString(date: Date | string, outputFormat?) {
    if (!date) {
      return '';
    }
    if (!outputFormat) {
      outputFormat = 'YYYY-M-D kk:mm';
      // outputFormat = 'YYYY-M-D kk:mm:ss';
    }
    let dz = moment(date);
    // dz.utcOffset(8);
    return dz.format(outputFormat);
  }

}

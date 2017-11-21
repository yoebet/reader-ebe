import {Model} from './model';
import {Para} from './para';

export class Chap extends Model {
  name: string;
  zhName: string = '';
  bookId: string;
  paras: Para[];
}

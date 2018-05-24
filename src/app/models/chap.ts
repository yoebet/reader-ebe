import {Model} from './model';
import {Para} from './para';

export class Chap extends Model {
  name: string;
  zhName: string = '';
  bookId: string;
  no: number;
  originalId: string;
  isFree: boolean;
  price: number;
  status: string = 'E';
  memo: string;

  paras: Para[];
}

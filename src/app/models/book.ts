import {Model} from './model';
import {Chap} from './chap';

export class Book extends Model {
  name: string;
  author: string;
  chaps: Chap[];

}

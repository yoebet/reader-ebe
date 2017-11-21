import {Model} from './model';
import {Chap} from './chap';

export class Book extends Model {
  name: string;
  zhName: string = '';
  author: string = '';
  zhAuthor: string = '';
  chaps: Chap[];

}

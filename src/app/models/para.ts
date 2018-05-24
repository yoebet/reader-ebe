import {Model} from './model';

export class Para extends Model {
  content: string = '';
  trans: string = '';
  chapId: string;
  bookId: string;
  originalId: string;
}

import {Model} from './model';
import {Book} from './book';

export class UserBook extends Model {
  userId: string;
  bookId: string;
  role: string;
  isAllChaps: boolean;
  chaps: any[];
  chapsCount: number;
  book: Book;

  static roles = ['', 'Admin', 'Editor'];
}

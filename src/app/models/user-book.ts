import {Model} from './model';
import {Book} from './book';

export class UserBook extends Model {
  userId: string;
  bookId: string;
  role: string;
  isAllChaps: boolean;
  chaps: any[];
  chapsCount: number;
  acquiredBy: boolean;
  book: Book;

  static Roles = ['', 'O', 'E'];
  static AcquiredMethods = {Purchase: 'P', Bestow: 'B'};
}

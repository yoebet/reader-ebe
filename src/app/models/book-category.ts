import {Model} from './model';

export class BookCategory extends Model {

  static CategoryNames = {
    Nov: '小说',
    Tex: '教材',
    Kid: '儿童',
    His: '历史',
    Poe: '诗歌',
    Oth: '其他'
  };

  code: string;
  name: string;
  listing = true;

  type: string;

  booksCount?: number;
}

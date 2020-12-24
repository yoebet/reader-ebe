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

  static Categories = ['Nov', 'Tex', 'Kid', 'His', 'Poe', 'Oth'].map(k => {
    return {value: k, label: BookCategory.CategoryNames[k]};
  });

  code: string;
  name: string;
  listing = true;

  type: string;

  booksCount: number;
}

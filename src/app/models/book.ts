import {Model} from './model';
import {Chap} from './chap';
import {UserBook} from "./user-book";

export class Book extends Model {
  code: string;
  name: string;
  zhName: string = '';
  author: string = '';
  zhAuthor: string = '';

  label: string;

  category: string;
  langType: string = 'EZ';
  description: string;

  status: string = 'E';
  isPrivate: boolean;

  chiefEditorId: string;
  chiefEditorName: string;

  isFree: boolean;
  price: number; // cents
  priceLabel: string;

  slogan: string;
  introduction: string;
  tags: string;

  annotationFamilyId: string;

  image: BookImage;

  contentPacks: { [name: string]: BookContentPack };

  chaps: Chap[];


  static CategoryNames = {
    Nov: '小说',
    Tex: '教材',
    His: '历史',
    Poe: '诗歌',
    Oth: '其他'
  };


  static Categories = ['Nov', 'Tex', 'His', 'Oth'].map(k => {
    return {value: k, label: Book.CategoryNames[k]}
  });

  static LangTypes = [
    {value: 'EZ', label: '英文原著 - 中文译文'},
    {value: 'ZE', label: '英文译文 - 中文原著'}/*,
    {value: 'CZ', label: '文言文/诗词 - 现代文/注释/解析'}*/
  ];


  static StatusNames = {
    E: '编辑中',
    C: '校对中',
    R: '已上线',
    B: '备份'
  };


  static Statuses = ['E', 'C', 'R'].map(k => {
    return {value: k, label: Book.StatusNames[k]}
  });

  static BookContentPackRoles = {
    Editor: 'e',
    Reader: 'r',
    Public: 'p'
  };

}

export class BookImage {
  file: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export class BookContentPack {
  role?: string;
  file: string;
  hash: string;
  size: number;
  chaps: number;
  builtAt: Date;
}

export class PrivilegedUsers {
  owner: UserBook;
  editors: UserBook[];
  readers: UserBook[];
}

import {Model} from './model';
import {Chap} from './chap';
import {UserBook} from './user-book';

export class BookBasic extends Model {
  code: string;
  name: string;
  zhName = '';
  author = '';
  zhAuthor = '';
}

export class Book extends BookBasic {

  static LangCodeEn = 'En';
  static LangCodeZh = 'Zh';
  static LangCodeZc = 'Zc';

  static LangTypes = [
    {value: Book.LangCodeEn, label: '英文'},
    {value: Book.LangCodeZh, label: '中文'},
    {value: Book.LangCodeZc, label: '文言文/诗词'}
  ];

  static StatusNames = {
    E: '编辑中',
    C: '校对中',
    R: '已上线',
    B: '备份'
  };


  static Statuses = ['E', 'C', 'R'].map(k => {
    return {value: k, label: Book.StatusNames[k]};
  });

  static BookContentPackRoles = {
    Editor: 'e',
    Reader: 'r',
    Public: 'p'
  };

  static PricingModes = [
    {value: 'B', label: '整书'},
    {value: 'C', label: '按章节'}
  ];

  label: string;

  contentLang = Book.LangCodeEn;
  transLang = Book.LangCodeZh;
  category: string;
  categoryName: string;
  description: string;

  status = 'E';
  isPrivate: boolean;

  chiefEditorId: string;
  chiefEditorName: string;

  chapsComplete: boolean;

  isFree: boolean;
  pricingMode: string; // B,C
  price: number; // cents
  pricePerChap: number;
  priceLabel: string;

  releasedAt: string;
  flags: number;

  slogan: string;
  introduction: string;
  tags: string;
  editExperiment = false;

  annotationFamilyId: string;

  image: BookImage;

  contentPacks: { [name: string]: BookContentPack };

  chaps: Chap[];

  editorRole: string;


  static isChineseText(lang) {
    return lang === Book.LangCodeZh || lang === Book.LangCodeZc;
  }

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
  // hash: string;
  size: number;
  chaps: number;
  builtAt: Date;
}

export class PrivilegedUsers {
  owner: UserBook;
  editors: UserBook[];
  readers: UserBook[];
}

import {Model} from './model';
import {Chap} from './chap';

export class Book extends Model {
  name: string;
  zhName: string = '';
  author: string = '';
  zhAuthor: string = '';
  status: string = 'E';
  visibility: string = 'E';
  langType: string = 'EZ';
  originalId: string;
  isFree: boolean;
  price: number;
  memo: string;
  tags: string;

  chaps: Chap[];


  static LangTypes = [
    {value: 'EZ', label: '英文原著 - 中文译文'},
    {value: 'ZE', label: '英文译文 - 中文原著'}/*,
    {value: 'CZ', label: '文言文/诗词 - 现代文/注释/解析'}*/
  ];

  static Statuses = [
    {value: 'E', label: '编辑'},
    {value: 'C', label: '校对'},
    {value: 'P', label: '上线审核'},
    {value: 'R', label: '上线'},
    {value: 'B', label: '备份'}
  ];

  static Visibilities = [
    {value: 'P', label: '公开'},
    {value: 'E', label: '编辑人员'}/*,
    {value: 'H', label: '仅管理员'}*/
  ];

}

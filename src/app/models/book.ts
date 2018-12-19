import {Model} from './model';
import {Chap} from './chap';

export class Book extends Model {
  code: string;
  name: string;
  zhName: string = '';
  author: string = '';
  zhAuthor: string = '';

  category: string;
  langType: string = 'EZ';
  description: string;

  status: string = 'E';
  // visibility: string = 'E';

  editorId: string;
  editorName: string;

  isFree: boolean;
  price: number; // cents

  slogan: string;
  statusText: string;
  pricingText: string;
  introduction: string;
  tags: string;

  annotationFamilyId: string;

  chaps: Chap[];


  static LangTypes = [
    {value: 'EZ', label: '英文原著 - 中文译文'},
    {value: 'ZE', label: '英文译文 - 中文原著'}/*,
    {value: 'CZ', label: '文言文/诗词 - 现代文/注释/解析'}*/
  ];


  static StatusNames = {
    E: '编辑中',
    C: '校对',
    P: '上线审核',
    R: '已上线',
    B: '备份'
  };


  static Statuses = ['E', 'C', 'P', 'R'].map(k => {
    return {value: k, label: Book.StatusNames[k]}
  });

  /*static Visibilities = [
    {value: 'P', label: '公开'},
    {value: 'E', label: '仅编辑人员可见'}/!*,
    {value: 'H', label: '仅管理员'}*!/
  ];*/

}

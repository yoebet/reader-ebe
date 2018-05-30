import {Model} from './model';

export class WordCategory extends Model {
  code: string;
  name: string;
  dictKey: string;
  dictOperator: string;
  dictValue: number;
  description: string;
  wordCount: number;
  extendTo: string;
  extendedWordCount: number;
  isFrequency: boolean;
  useAsUserBase: boolean;

  extend: WordCategory;

  static DictOperators = [
    {value: '', label: '='},
    {value: 'gt', label: '>'},
    {value: 'gte', label: '>='},
    {value: 'lt', label: '<'},
    {value: 'lte', label: '<='},
    {value: 'ne', label: '<>'}
  ];
}

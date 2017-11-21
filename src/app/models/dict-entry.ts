import {Model} from './model';

export class DictEntrySimple extends Model {
  word: string;
  explain: string;
}

export class DictEntry extends DictEntrySimple {
  // complete: [
  //   {
  //     pos: 'noun',
  //     items: [
  //       { id: 1, explain: '' },
  //       { id: 2, explain: '' }
  //       ]
  //   },
  //   {
  //     pos: 'verb',
  //     items: [
  //       { id: 3, explain: '' },
  //       { id: 4, explain: '' }
  //       ]
  //   }
  //   ]
  complete?: PosMeanings[] = [];
  nextItemId: number = 1;
  categories: any = {};
  phonetic?: any;
  phrases?: any[];
  // forms?: any[];
  // sentences?: any[];
  // usageTips?: any[];


  static nextMeaningItemId(entry) {
    if (!entry.nextItemId) {
      entry.nextItemId = 1;
    }
    let id = entry.nextItemId;
    entry.nextItemId++;
    return id;
  }

}

export class PosMeanings {
  //Part Of Speech
  pos: string = null;
  items: MeaningItem[] = [];
}

export class MeaningItem {
  id: number = null;
  tags: string[];
  explain: string;
}


export const WordCategories = [
  {key: 'cet4', name: 'CET 4'},
  {key: 'cet6', name: 'CET 6'},
  {key: 'gre', name: 'GRE'},
  {key: 'yasi', name: '雅思'},
  {key: 'pro4', name: '专四'},
  {key: 'pro8', name: '专八'}
];


export const PosTags = {
  common: [
    {value: 'idiom', label: '习语'},
    {value: 'colloquial', label: '口语'},
    {value: 'figurative', label: '比喻'},
    {value: 'slang', label: '俚语'},
    {value: 'euphemism', label: '委婉'}
  ],
  'n.': [
    {value: 'individual', label: '个体'},
    {value: 'collective', label: '集体'},
    {value: 'material', label: '物质'},
    {value: 'abstract', label: '抽象'},
    {value: 'countable', label: '可数'},
    {value: 'uncountable', label: '不可数'},
    {value: 'singular', label: '单数'},
    {value: 'countable', label: '复数'},
    {value: 'gerund', label: '动名词'},
    {value: 'proper', label: '专有'}
  ],
  'v.': [
    {value: 'transitive', label: 'vt.'},
    {value: 'intransitive', label: 'vi.'},
    {value: 'ergative', label: 'vi.&vt.'},
    {value: 'link', label: '系动词'},
    {value: 'modal', label: '情态'},
    {value: 'ditransitive', label: '双宾'},
    {value: 'irregular', label: '不规则'},
    {value: 'instantaneous', label: '短暂'}
  ]
};

export const TagLabelMap = {};

for (let pos in PosTags) {
  let tags = PosTags[pos];
  if (tags) {
    for (let tag of tags) {
      TagLabelMap[tag.value] = tag.label;
    }
  }
}

export const POS = [
  {abbr: 'n.', name: 'n. 名词'},
  {abbr: 'v.', name: 'v. 动词'},
  {abbr: 'adj.', name: 'adj. 形容词'},
  {abbr: 'adv.', name: 'adv. 副词'},
  {abbr: 'prep.', name: 'prep. 介词'},
  {abbr: 'pron.', name: 'pron. 代词'},
  {abbr: 'conj.', name: 'conj. 连词'},
  {abbr: 'int.', name: 'int. 感叹词'},
  {abbr: 'other', name: 'other...'},
];

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

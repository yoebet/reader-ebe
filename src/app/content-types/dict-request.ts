import {DictEntry} from '../models/dict-entry';
import {DictZh} from '../models/dict-zh';

export class DictRequest {
  dictLang: string;// en/zh
  wordElement: Element;
  dictEntry: DictEntry | DictZh;
  initialSelected: SelectedItem;
  relatedWords?: string[];
  meaningItemCallback: (selected: SelectedItem) => void;

  simplePopup = false;
}

export class MeaningRequest {
  wordElement: Element;
  initialSelected: SelectedItem;
  meaningItemCallback: (selected: SelectedItem) => void;
  onRequestDict: (word: string,
                  callback: (selected: SelectedItem) => void,
                  notFoundCallback: () => void) => void;
}

export class SelectedItem {
  word?: string;
  pos?: string = '';
  meaning?: string;
  forPhraseGroup?: string;
}

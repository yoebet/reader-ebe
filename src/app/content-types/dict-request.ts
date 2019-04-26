import {DictEntry} from '../models/dict-entry';
import {DictZh} from '../models/dict-zh';

export class DictRequest {
  dictLang: string;// en/zh
  wordElement: Element;
  dictEntry: DictEntry | DictZh;
  initialSelected?: SelectedItem;
  relatedWords?: string[];
  meaningItemCallback: (selected: SelectedItem) => void;

  simplePopup = false;
}

export class SelectedItem {
  word?: string;
  pos?: string;
  meaning?: string;
}

import {DictEntry} from '../models/dict-entry';

export class DictRequest {
  wordElement: Element;
  dictEntry: DictEntry;
  initialSelected?: SelectedItem;
  relatedWords?: string[];
  meaningItemCallback: (selected: DictSelectedResult) => void;
}

export class SelectedItem {
  itemId: number;
  meaning?: string;
}

export class DictSelectedResult extends SelectedItem {
  word?: string;
}

import {DictEntry} from '../models/dict-entry';

export class DictRequest {
  wordElement: Element;
  dictEntry: DictEntry;
  meaningItemId: number;
  relatedWords?: string[];
  meaningItemCallback: (selected: { word: string, selectedItemId: number }) => void;
}

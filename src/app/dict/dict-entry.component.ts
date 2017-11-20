import {Component, Input} from '@angular/core';

import {DictEntry, PosMeanings, MeaningItem, TagLabelMap} from '../models/dict-entry';
import {DictService} from '../services/dict.service';

@Component({
  selector: 'dict-entry',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryComponent {

  @Input() entry: DictEntry;

  constructor(private dictService: DictService) {
  }

  get cats() {
    return this.entry.categories;
  }

  get tagLabelMap() {
    return TagLabelMap;
  }

  clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {

  }

}

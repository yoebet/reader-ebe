import {Component, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';

import {DictEntry, PosMeanings, MeaningItem, TagLabelMap} from '../models/dict-entry';
import {DictService} from '../services/dict.service';

@Component({
  selector: 'dict-entry',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryComponent implements AfterViewInit {
  @Input() entry: DictEntry;
  @Input() selectedItemId: number;
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter();
  viewReadyEntry = null;
  selectedItemChanged = false;

  constructor(private dictService: DictService) {
  }

  get cats() {
    return this.entry.categories;
  }

  get tagLabelMap() {
    return TagLabelMap;
  }

  clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    if (this.selectedItemId !== mi.id) {
      this.selectedItemId = mi.id;
      this.selectedItemChanged = true;
    }
  }

  ngAfterViewInit() {
    console.log(this.entry);
    if (this.viewReadyEntry === this.entry) {
      return;
    }
    this.viewReady.emit();
    this.viewReadyEntry = this.entry;
  }

  cancel() {
    this.dictItemSelected.emit(null);
  }

  done() {
    this.dictItemSelected.emit(this.selectedItemId);
  }

}

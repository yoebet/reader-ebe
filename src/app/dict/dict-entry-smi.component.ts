import {
  Component, Input, Output, EventEmitter,
  AfterViewChecked, ChangeDetectorRef
} from '@angular/core';

import {DictEntry, PosMeanings, MeaningItem} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {DictEntryComponent} from './dict-entry.component';

@Component({
  selector: 'dict-entry-smi',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntrySmiComponent extends DictEntryComponent implements AfterViewChecked {
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter<{ word: string, selectedItemId: number }>();

  viewReadyEntry = null;


  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    super(cdr, dictService);
    this.autoSaveOnAdoptItem = true;
    this.selectMeaningItem = true;
  }


  ngAfterViewChecked() {
    if (this.viewReadyEntry === this.entry) {
      return;
    }
    this.viewReady.emit();
    this.viewReadyEntry = this.entry;
  }

  cancelSelect() {
    this.dictItemSelected.emit(null);
  }

  doneSelect() {
    let word = this.entry.word;
    let selectedItemId = this.selectedItemId;
    if (word === this.initialWord) {
      // null: no change; -1: unset
      if (this.initialSelectedItemId === this.selectedItemId) {
        selectedItemId = null;
      } else if (this.initialSelectedItemId !== null && this.selectedItemId == null) {
        selectedItemId = -1;
      }
    }
    this.dictItemSelected.emit({word, selectedItemId});
  }

}

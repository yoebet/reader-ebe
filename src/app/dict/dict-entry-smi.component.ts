import {
  Component, Output, EventEmitter,
  AfterViewChecked, ChangeDetectorRef
} from '@angular/core';

import {DictService} from '../services/dict.service';
import {DictEntryComponent} from './dict-entry.component';
import {DictSelectedResult} from '../chap-types/dict-request';
import {SelectedItem} from "../chap-types/dict-request";

@Component({
  selector: 'dict-entry-smi',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntrySmiComponent extends DictEntryComponent implements AfterViewChecked {
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter<DictSelectedResult>();

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
    let initial = this.initialSelectedItem || {} as SelectedItem;
    let selected = this.selectedItem || {} as SelectedItem;
    let {itemId, meaning} = selected;
    if (word === this.initialWord) {
      // null: no change; -1: unset
      if (initial.itemId === itemId) {
        itemId = null;
      } else if (initial.itemId !== null && itemId == null) {
        itemId = -1;
      }
    }
    let result = {word, itemId, meaning};
    this.dictItemSelected.emit(result);
  }

}

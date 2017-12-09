import {
  Component, Input, Output, EventEmitter,
  OnInit, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';

import {DictEntry, PosMeanings, MeaningItem} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {DictEntryComponent} from './dict-entry.component';

@Component({
  selector: 'dict-entry-compact',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryCompactComponent extends DictEntryComponent implements OnInit, AfterViewChecked {
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter<number>();
  viewReadyEntry = null;
  oriItemId = null;
  editing = false;
  editModal = null;

  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    super(cdr, dictService);
  }

  ngOnInit() {
    this.oriItemId = this.selectedItemId;
  }


  clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    if (mi.id === this.selectedItemId) {
      // null: no change; -1: unset
      this.selectedItemId = (this.oriItemId === null) ? null : -1;
      return;
    }
    this.selectedItemId = mi.id;
  }

  ngAfterViewChecked() {
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

  onUpdate(updated) {
    this.entry = updated;
    this.editModal.approve('');
  }

  onCancelEdit() {
    this.editModal.deny(null);
  }

}

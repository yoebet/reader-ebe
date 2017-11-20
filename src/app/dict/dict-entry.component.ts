import {Component, Input, Output, EventEmitter, OnInit, AfterViewInit} from '@angular/core';

import {DictEntry, PosMeanings, MeaningItem, TagLabelMap} from '../models/dict-entry';
import {DictService} from '../services/dict.service';

@Component({
  selector: 'dict-entry',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryComponent implements OnInit, AfterViewInit {
  @Input() entry: DictEntry;
  @Input() selectedItemId: number;
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter();
  viewReadyEntry = null;
  oriItemId = null;

  constructor(private dictService: DictService) {
  }

  ngOnInit() {
    this.oriItemId = this.selectedItemId;
  }

  get cats() {
    return this.entry.categories;
  }

  get tagLabelMap() {
    return TagLabelMap;
  }

  clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    if (mi.id === this.selectedItemId) {
      // null: not set; -1: unset
      this.selectedItemId = (this.oriItemId === null) ? null : -1;
      return;
    }
    this.selectedItemId = mi.id;
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

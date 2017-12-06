import {
  Component, Input, Output, OnChanges,
  SimpleChanges, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import {uniq} from 'lodash';

import {
  DictEntry,
  evaluateCategoryTags,
  TagLabelMap
} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'dict-entry',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryComponent implements OnChanges {
  @Input() entry: DictEntry;
  cdr: ChangeDetectorRef;
  dictService: DictService;
  categoryTags = null;
  entryStack = [];

  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    this.cdr = cdr;
    this.dictService = dictService;
  }


  goto(word: string) {
    this.dictService.getEntry(word)
      .subscribe(e => {
          if (!e) {
            return;
          }
          this.entryStack.push(this.entry);
          this.entry = e;
          this.onEntryChanged();
        }
      );
  }

  goback() {
    if (this.entryStack.length > 0) {
      this.entry = this.entryStack.pop();
      this.onEntryChanged();
    }
  }

  private onEntryChanged() {
    let entry = this.entry;
    this.categoryTags = evaluateCategoryTags(entry.categories);
    this.cdr.detectChanges();
  }

  // get tagLabelMap() {
  //   return TagLabelMap;
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entry) {
      let pre = changes.entry.previousValue;
      if (pre) {
        this.entryStack.push(pre);
      }
      this.onEntryChanged();
    }
  }

}

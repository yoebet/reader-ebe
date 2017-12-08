import {
  Component, Input, Output, OnChanges,
  SimpleChanges, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import {max} from 'lodash';

import {
  DictEntry,
  PosMeanings,
  MeaningItem,
  TagLabelMap,
  PosTags
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

  editingCompleteMeanings = null;
  editing = false;
  editingPosMeanings: PosMeanings = null;
  editingMeaningItem: MeaningItem = null;
  newPos = null;
  newItem = null;
  sortMeaningItems = false;
  posOptions = null;


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
    this.categoryTags = DictEntry.EvaluateCategoryTags(entry.categories);
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entry) {
      let pre = changes.entry.previousValue;
      if (pre) {
        this.entryStack.push(pre);
      }
      this.onEntryChanged();
    }
  }


  get posTags() {
    let pt = PosTags;
    let merged = pt.common;
    let pm = this.editingPosMeanings;
    if (pm && pt[pm.pos]) {
      merged = pt[pm.pos].concat(merged);
    }
    return merged;
  }

  get tagLabelMap() {
    return TagLabelMap;
  }

  startEditing() {
    if (this.entry.complete) {
      //deep clone
      this.editingCompleteMeanings =
        JSON.parse(JSON.stringify(this.entry.complete));
    } else {
      this.editingCompleteMeanings = [];
    }
    this.editing = true;
  }

  private _endEditing() {
    this.editingCompleteMeanings = null;
    this.editing = false;
    this.editingPosMeanings = null;
    this.editingMeaningItem = null;
    this.newPos = null;
    this.newItem = null;
  }

  saveEdit() {
    let entry = this.entry;

    this.editingCompleteMeanings = this.editingCompleteMeanings
      .filter(pm => pm.items && pm.items.length > 0);

    let oriCompleteMeanings = entry.complete;
    let ori = JSON.stringify(oriCompleteMeanings);
    let current = JSON.stringify(this.editingCompleteMeanings);
    if (current == ori) {
      this._endEditing();
      return;
    }
    let updateObj = {
      _id: entry._id,
      word: entry.word,
      complete: this.editingCompleteMeanings
    } as DictEntry;
    this.dictService.update(updateObj)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        entry.complete = this.editingCompleteMeanings;
        this._endEditing();
      });
  }

  cancelEdit() {
    this._endEditing();
  }

  private stopEvent($event) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
  }

  newPosMeanings() {
    this.newPos = new PosMeanings();
    let poss = this.editingCompleteMeanings.map(pm => pm.pos);
    this.posOptions = DictEntry.POS
      .filter(posOption => poss.indexOf(posOption.abbr) === -1);
  }

  newMeaningItem(pm: PosMeanings, $event?) {
    this.editingPosMeanings = pm;
    this.newItem = new MeaningItem();
    this.stopEvent($event);
  }

  editMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    this.editingPosMeanings = pm;
    this.editingMeaningItem = mi;
  }

  removeMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    pm.items = pm.items.filter(item => item !== mi);
  }


  private swapArrayElements(arr, index1, index2) {
    if (index1 < 0 || index2 >= arr.length) {
      return;
    }
    let t = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = t;
  }

  moveUpPos(pm: PosMeanings, $event) {
    let complete = this.editingCompleteMeanings;
    let index = complete.indexOf(pm);
    this.swapArrayElements(complete, index - 1, index);
    this.stopEvent($event);
  }

  moveDownPos(pm: PosMeanings, $event) {
    let complete = this.editingCompleteMeanings;
    let index = complete.indexOf(pm);
    this.swapArrayElements(complete, index, index + 1);
    this.stopEvent($event);
  }

  moveUpMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    let index = pm.items.indexOf(mi);
    this.swapArrayElements(pm.items, index - 1, index);
  }

  moveDownMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    let index = pm.items.indexOf(mi);
    this.swapArrayElements(pm.items, index, index + 1);
  }

  addPosMeanings() {
    let newPos = this.newPos;
    console.log(newPos);
    if (!newPos || !newPos.pos) {
      return;
    }
    let complete = this.editingCompleteMeanings;
    if (complete.find(pm => pm.pos == newPos.pos)) {
      alert('词性已存在');
      return;
    }

    complete.push(newPos);
    this.newPos = null;

    this.newMeaningItem(newPos);
  }


  nextMeaningItemId(complete: PosMeanings[]) {
    let maxId: number = max(complete.map((pms: PosMeanings) =>
      max(pms.items.map((item: MeaningItem) => item.id))));
    if (!maxId) {
      maxId = 0;
    }
    return maxId + 1;
  }

  addMeaningItem() {
    let ni = this.newItem;
    if (!ni || !ni.exp) {
      return;
    }
    ni.id = this.nextMeaningItemId(this.editingCompleteMeanings);
    if (!this.editingPosMeanings.items) {
      this.editingPosMeanings.items = [];
    }
    this.editingPosMeanings.items.push(ni);
    this.newItem = null;
  }


}

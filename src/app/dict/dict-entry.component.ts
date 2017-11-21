import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';

import {DictEntry, PosMeanings, MeaningItem, PosTags, WordCategories, TagLabelMap, POS} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'dict-entry',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryComponent implements OnInit {
  @Input() entry: DictEntry;
  @Input() inModal: boolean;
  @Output() onUpdate = new EventEmitter<DictEntry>();
  @Output() onCancelEdit = new EventEmitter();
  _originEntry: DictEntry;
  editing = false;
  editingSimpleExplain = false;
  editingPosMeanings: PosMeanings = null;
  editingMeaningItem: MeaningItem = null;
  newPos = null;
  newItem = null;
  sortMeaningItems = false;
  editCategories = false;
  posOptions = null;


  constructor(private dictService: DictService) {
  }

  ngOnInit() {
    if (this.inModal) {
      this.startEditing();
    }
  }

  get wordCats() {
    return WordCategories;
  }

  get cats() {
    return this.entry.categories;
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
    this._originEntry = this.entry;
    //deep clone
    this.entry = JSON.parse(JSON.stringify(this.entry));
    this.editing = true;
  }

  private _endEditing() {
    this.editing = false;
    this.editingSimpleExplain = false;
    this.editingPosMeanings = null;
    this.editingMeaningItem = null;
    this.newPos = null;
    this.newItem = null;
    this.editCategories = false;
    this._originEntry = null;
  }

  saveEdit() {
    let entry = this.entry;
    if (entry.explain == null) {
      entry.explain = '';
    }
    entry.explain = entry.explain.trim();
    if (entry.explain == '') {
      alert('请输入释义');
      return;
    }

    entry.complete = entry.complete
      .filter(pm => pm.items && pm.items.length > 0);

    let ori = JSON.stringify(this._originEntry);
    let current = JSON.stringify(entry);
    if (current == ori) {
      this._endEditing();
      return;
    }
    this.dictService.update(entry)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this._endEditing();

        this.onUpdate.emit(entry);
      });
  }

  cancelEdit() {
    this.entry = this._originEntry;
    this._endEditing();
    this.onCancelEdit.emit();
  }

  // clickSimpleExplain() {
  //   if (this.editing) {
  //     this.editingSimpleExplain = true;
  //   }
  // }

  // clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {
  //   if (this.editing) {
  //     this.editMeaningItem(pm, mi);
  //   }
  // }

  newPosMeanings() {
    this.newPos = new PosMeanings();
    let poss = this.entry.complete.map(pm => pm.pos);
    this.posOptions = POS
      .filter(posOption => poss.indexOf(posOption.abbr) === -1);
  }

  newMeaningItem(pm: PosMeanings) {
    this.editingPosMeanings = pm;
    this.newItem = new MeaningItem();
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

  moveUpPos(pm: PosMeanings) {
    let complete = this.entry.complete;
    let index = complete.indexOf(pm);
    this.swapArrayElements(complete, index - 1, index);
  }

  moveDownPos(pm: PosMeanings) {
    let complete = this.entry.complete;
    let index = complete.indexOf(pm);
    this.swapArrayElements(complete, index, index + 1);
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
    if (!newPos || !newPos.pos) {
      return;
    }
    let complete = this.entry.complete;
    if (!complete) {
      complete = this.entry.complete = [];
    } else if (complete.find(pm => pm.pos == newPos.pos)) {
      alert('词性已存在');
      return;
    }

    complete.push(newPos);
    this.newPos = null;
  }

  addMeaningItem() {
    let ni = this.newItem;
    if (!ni || !ni.explain) {
      return;
    }
    ni.id = DictEntry.nextMeaningItemId(this.entry);
    if (!this.editingPosMeanings.items) {
      this.editingPosMeanings.items = [];
    }
    this.editingPosMeanings.items.push(ni);
    this.newItem = null;
  }

}

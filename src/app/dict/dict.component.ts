import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {DictEntry, PosMeanings, MeaningItem, PosTags, TagLabelMap, POS} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {OpResult} from '../models/op-result';

import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'dict-main',
  templateUrl: './dict.component.html',
  styleUrls: ['./dict.component.css']
})
export class DictComponent {

  _originEntry: DictEntry;
  entry: DictEntry;
  editing = false;
  editingSimpleExplain = false;
  editingPosMeanings: PosMeanings = null;
  editingMeaningItem: MeaningItem = null;
  newPos = null;
  newItem = null;
  sortMeaningItems = false;
  editCategories = false;

  entryHistory: DictEntry[] = [];

  posOptions = null;


  dictSearch = (key: string) => {
    key = key.trim();
    let o = this.dictService.search(key);
    return o.toPromise();
  };

  constructor(private dictService: DictService,
              private router: Router) {
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

  selectEntry(entrySimple) {
    this.dictService.getOne(entrySimple._id)
      .subscribe(e => {
          if (!e.explain) {
            e.explain = '...';
          }
          if (!e.complete) {
            e.complete = [];
          }
          if (!e.categories) {
            e.categories = {};
          }
          this.entry = e;
          let eh = this.entryHistory;
          let inHistory = eh.find(eh => eh.word === e.word);
          if (!inHistory) {
            eh.push(e);
          }
          if (eh.length > 10) {
            eh.shift();
          }
        }
      )
  }

  selectHistoryEntry(entry) {
    this.entry = entry;
  }

  startEditing() {
    this._originEntry = this.entry;
    //deep clone
    this.entry = JSON.parse(JSON.stringify(this.entry));
    this.editing = true;
  }

  _endEditing() {
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

        let index = this.entryHistory
          .findIndex(eh => eh.word === entry.word);
        if (index >= 0) {
          this.entryHistory[index] = entry;
        }
      });
  }

  clickSimpleExplain() {
    if (this.editing) {
      this.editingSimpleExplain = true;
    }
  }

  clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    if (this.editing) {
      this.editMeaningItem(pm, mi);
    }
  }

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

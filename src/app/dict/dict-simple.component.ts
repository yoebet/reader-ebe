import {Component, ChangeDetectorRef} from '@angular/core';

import {DictEntry, SimpleMeaning, PosTags} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {OpResult} from '../models/op-result';
import {DictBaseComponent} from './dict-base.component';

@Component({
  selector: 'dict-simple',
  templateUrl: './dict-simple.component.html'
})
export class DictSimpleComponent extends DictBaseComponent {
  sortMeaningItems = false;
  deleteItems = false;

  editingMeanings: SimpleMeaning[] = null;
  editingItem: SimpleMeaning = null;
  newItem: SimpleMeaning = null;
  posOptions = null;


  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    super(cdr, dictService);
  }

  get posTags() {
    let pt = PosTags;
    let merged = pt.common;
    let pm = this.editingItem;
    if (pm && pt[pm.pos]) {
      merged = pt[pm.pos].concat(merged);
    }
    return merged;
  }

  startEditing() {
    if (this.entry.simple) {
      //deep clone
      this.editingMeanings =
        JSON.parse(JSON.stringify(this.entry.simple));
    } else {
      this.editingMeanings = [];
    }
    // console.log('startEditing: ' + this.entry.word + ' ' + JSON.stringify(this.editingMeanings));
    this.editing = true;
  }

  cancelEdit() {
    this.editing = false;
    this.editingMeanings = null;
    this.editingItem = null;
    this.newItem = null;
  }

  everEdited(oriEntry): boolean {
    let em = this.editingMeanings;
    let oriMeanings = oriEntry.simple;
    let ori = JSON.stringify(oriMeanings);
    let current = JSON.stringify(em);
    return current != ori;
  }

  saveEdit(entry?, thenGotoWord?: string) {
    if (!entry) {
      entry = this.entry
    }
    if (!this.everEdited(entry)) {
      this.cancelEdit();
      return;
    }

    let em = this.editingMeanings;
    // console.log('saveEdit: ' + entry.word + ' ' + JSON.stringify(this.editingMeanings));
    let updateObj = {
      _id: entry._id,
      word: entry.word,
      simple: em,
      simpleEdited: 'y'
    } as DictEntry;
    this.dictService.update(updateObj)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        entry.simple = em;
        if (entry === this.entry) {
          this.cancelEdit();
        }
        if (thenGotoWord) {
          this._gotoWord(thenGotoWord);
        }
      });
  }

  newMeaningItem($event?) {
    this.newItem = new SimpleMeaning();
    let poss = this.editingMeanings.map(m => m.pos);
    this.posOptions = DictEntry.POS
      .filter(posOption => poss.indexOf(posOption.abbr) === -1);
    this.stopEvent($event);
  }

  editMeaningItem(item: SimpleMeaning, $event) {
    this.editingItem = item;
    this.posOptions = DictEntry.POS;
    this.stopEvent($event);
  }

  removeMeaningItem(item: SimpleMeaning, $event) {
    this.editingMeanings = this.editingMeanings.filter(m => m !== item);
    this.stopEvent($event);
  }

  moveUpMeaningItem(item: SimpleMeaning, $event) {
    let index = this.editingMeanings.indexOf(item);
    this.swapArrayElements(this.editingMeanings, index - 1, index);
    this.stopEvent($event);
  }

  moveDownMeaningItem(item: SimpleMeaning, $event) {
    let index = this.editingMeanings.indexOf(item);
    this.swapArrayElements(this.editingMeanings, index, index + 1);
    this.stopEvent($event);
  }

  importMeaningItem(item: SimpleMeaning, from) {
    if (this.editingMeanings.find(m => m.pos == item.pos && m.exp == item.exp)) {
      alert('释义已存在');
      return;
    }
    this.editingMeanings.push(item);
  }

  useMeanings(meanings: SimpleMeaning[], $event) {
    this.editingMeanings = JSON.parse(JSON.stringify(meanings));
    this.stopEvent($event);
  }

  addMeaningItem() {
    let ni = this.newItem;
    if (!ni) {
      return;
    }
    this.editingMeanings.push(ni);
    this.newItem = null;
  }

}

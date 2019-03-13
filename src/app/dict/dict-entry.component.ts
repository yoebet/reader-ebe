import {Component, Input, SimpleChanges, ChangeDetectorRef} from '@angular/core';
import {max} from 'lodash';

import {DictEntry, PosMeanings, MeaningItem, PosTags} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {OpResult} from '../models/op-result';
import {DictBaseComponent} from "./dict-base.component";
import {SelectedItem} from "../chap-types/dict-request";

@Component({
  selector: 'dict-entry',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryComponent extends DictBaseComponent {
  @Input() initialSelectedItem: SelectedItem;

  initialWord: string;
  selectedItem: SelectedItem;
  autoSaveOnAdoptItem = false;
  coTabActive = false;
  selectMeaningItem = false;

  sortMeaningItems = false;
  deleteItems = false;

  editingCompleteMeanings: PosMeanings[] = null;
  editingPosMeanings: PosMeanings = null;
  editingMeaningItem: MeaningItem = null;
  newPos: PosMeanings = null;
  newItem: MeaningItem = null;
  posOptions = null;


  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    super(cdr, dictService);
  }

  get initialSelectedItemId() {
    if (!this.initialSelectedItem) {
      return null;
    }
    return this.initialSelectedItem.itemId;
  }

  get selectedItemId() {
    if (!this.selectedItem) {
      return null;
    }
    return this.selectedItem.itemId;
  }

  ngOnInit() {
    super.ngOnInit();
    this.initialWord = this.entry.word;
    let isi = this.initialSelectedItem;
    if (isi) {
      this.selectedItem = {itemId: isi.itemId, meaning: isi.meaning};
    } else {
      this.selectedItem = null;
    }
  }


  onEntryChanged() {
    let entry = this.entry;
    this.categoryTags = DictEntry.EvaluateCategoryTags(entry.categories);
    this.resetRefWords();
    if (entry.word === this.initialWord) {
      let isi = this.initialSelectedItem;
      if (isi) {
        this.selectedItem = {itemId: isi.itemId, meaning: isi.meaning};
      } else {
        this.selectedItem = null;
      }
    } else {
      this.selectedItem = null;
    }
    if (this.autoEnterEditing) {
      this.startEditing();
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entry) {
      if (this.selectMeaningItem) {
        this.entryStack = [];
      } else {
        this.pushPreviousIfNeeded(changes.entry.previousValue);
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

  cancelEdit() {
    this.editingCompleteMeanings = null;
    this.editing = false;
    this.editingPosMeanings = null;
    this.editingMeaningItem = null;
    this.newPos = null;
    this.newItem = null;
  }

  everEdited(oriEntry) {
    let ecm = this.editingCompleteMeanings
      .filter(pm => pm.items && pm.items.length > 0);
    let oriMeanings = oriEntry.complete;
    let ori = JSON.stringify(oriMeanings);
    let current = JSON.stringify(ecm);
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
    let ecm = this.editingCompleteMeanings
      .filter(pm => pm.items && pm.items.length > 0);
    let updateObj = {
      _id: entry._id,
      word: entry.word,
      complete: ecm
    } as DictEntry;
    this.dictService.update(updateObj)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        entry.complete = ecm;
        if (entry === this.entry) {
          this.cancelEdit();
        }
        if (thenGotoWord) {
          this._gotoWord(thenGotoWord);
        }
      });
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

  editMeaningItem(pm: PosMeanings, mi: MeaningItem, $event) {
    this.editingPosMeanings = pm;
    this.editingMeaningItem = mi;
    this.stopEvent($event);
  }

  removeMeaningItem(pm: PosMeanings, mi: MeaningItem, $event) {
    pm.items = pm.items.filter(item => item !== mi);
    this.stopEvent($event);
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

  moveUpMeaningItem(pm: PosMeanings, mi: MeaningItem, $event) {
    let index = pm.items.indexOf(mi);
    this.swapArrayElements(pm.items, index - 1, index);
    this.stopEvent($event);
  }

  moveDownMeaningItem(pm: PosMeanings, mi: MeaningItem, $event) {
    let index = pm.items.indexOf(mi);
    this.swapArrayElements(pm.items, index, index + 1);
    this.stopEvent($event);
  }

  addPosMeanings() {
    let newPos = this.newPos;
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

  clickMeaningItem(mi: MeaningItem) {
    if (mi === this.editingMeaningItem || mi === this.newItem) {
      return;
    }
    if (this.selectedItem && mi.id === this.selectedItem.itemId) {
      this.selectedItem = null;
    } else {
      this.selectedItem = {itemId: mi.id, meaning: mi.exp};
    }
  }


  adoptMeaningItem(pos, exp) {
    if (!this.editing) {
      this.startEditing();
      if (this.autoSaveOnAdoptItem) {
        this.editing = false;
      }
    }
    let complete = this.editingCompleteMeanings;
    let posMeanings = complete.find(pms => pms.pos === pos);
    if (!posMeanings) {
      posMeanings = new PosMeanings();
      posMeanings.pos = pos;
      complete.push(posMeanings);
    }
    let items = posMeanings.items;
    if (items) {
      let existed = items.find(item => item.exp === exp);
      if (existed) {
        return;
      }
    } else {
      items = [];
      posMeanings.items = items;
    }
    let item = new MeaningItem();
    item.id = this.nextMeaningItemId(complete);
    item.exp = exp;
    items.push(item);

    if (this.autoSaveOnAdoptItem) {
      this.selectedItem = {itemId: item.id, meaning: item.exp};
      this.coTabActive = true;
      this.saveEdit();
    }
  }

  cancelSelect() {

  }

  doneSelect() {

  }

}

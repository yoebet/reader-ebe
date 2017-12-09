import {
  Component, Input, Output, OnInit, OnChanges,
  SimpleChanges, EventEmitter, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import {max, union, last, difference} from 'lodash';

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
export class DictEntryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() entry: DictEntry;
  @Input() initialSelectedItemId: number;
  @Input() relatedWords: string[];
  cdr: ChangeDetectorRef;
  dictService: DictService;
  categoryTags: string[];
  refWords: string[];

  entryStack = [];
  initialWord: string;
  selectedItemId: number;
  autoSaveOnAdoptItem = false;
  autoSaveOnLeave = true;
  coTabActive = false;
  selectMeaningItem = false;

  sortMeaningItems = false;
  deleteItems = false;

  editing = false;
  editingCompleteMeanings: PosMeanings[] = null;
  editingPosMeanings: PosMeanings = null;
  editingMeaningItem: MeaningItem = null;
  newPos: PosMeanings = null;
  newItem: MeaningItem = null;
  posOptions = null;


  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    this.cdr = cdr;
    this.dictService = dictService;
  }

  ngOnInit() {
    this.initialWord = this.entry.word;
    this.selectedItemId = this.initialSelectedItemId;
  }

  ngOnDestroy() {
    if (this.editing && this.autoSaveOnLeave) {
      this.saveEdit();
    }
  }

  private _gotoWord(word: string) {
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

  goto(word: string) {
    if (this.editing) {
      if (this.autoSaveOnLeave) {
        this.saveEdit(null, word);
      } else {
        this._endEditing();
      }
    } else {
      this._gotoWord(word);
    }
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
    this.refWords = null;
    let refWords = union(entry.baseForms, this.relatedWords);
    if (refWords.length > 0) {
      let previous = last(this.entryStack);
      if (previous) {
        refWords = refWords.filter(w => w !== previous);
      }
      if (refWords.length > 0) {
        this.refWords = refWords;
      }
    }
    if (entry.word === this.initialWord) {
      this.selectedItemId = this.initialSelectedItemId;
    } else {
      this.selectedItemId = null;
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entry) {
      let pre = changes.entry.previousValue;
      if (pre) {
        this.entryStack.push(pre);
        if (this.editing && this.autoSaveOnLeave) {
          this.saveEdit(pre);
        }
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

  saveEdit(entry?, thenGotoWord?: string) {
    if (!entry) {
      entry = this.entry
    }

    let ecm = this.editingCompleteMeanings
      .filter(pm => pm.items && pm.items.length > 0);

    let oriCompleteMeanings = entry.complete;
    let ori = JSON.stringify(oriCompleteMeanings);
    let current = JSON.stringify(ecm);
    if (current == ori) {
      this._endEditing();
      return;
    }
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
        this._endEditing();
        if (thenGotoWord) {
          this._gotoWord(thenGotoWord);
        }
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

  editMeaningItem(pm: PosMeanings, mi: MeaningItem, $event) {
    this.editingPosMeanings = pm;
    this.editingMeaningItem = mi;
    this.stopEvent($event);
  }

  removeMeaningItem(pm: PosMeanings, mi: MeaningItem, $event) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    pm.items = pm.items.filter(item => item !== mi);
    this.stopEvent($event);
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

  clickMeaningItem(mi: MeaningItem) {
    if (mi === this.editingMeaningItem || mi === this.newItem) {
      return;
    }
    if (mi.id === this.selectedItemId) {
      this.selectedItemId = null;
    } else {
      this.selectedItemId = mi.id;
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
      this.selectedItemId = item.id;
      this.coTabActive = true;
      this.saveEdit();
    }
  }

  cancelSelect() {

  }

  doneSelect() {

  }


}

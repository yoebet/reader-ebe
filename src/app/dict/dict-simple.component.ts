import {
  Component, Input, OnInit, OnChanges,
  SimpleChanges, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import {union, last} from 'lodash';

import {DictEntry, SimpleMeaning, TagLabelMap, PosTags} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {Model} from '../models/model';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'dict-simple',
  templateUrl: './dict-simple.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictSimpleComponent implements OnInit, OnChanges, OnDestroy {
  @Input() entry: DictEntry;
  @Input() relatedWords: string[];
  cdr: ChangeDetectorRef;
  dictService: DictService;
  categoryTags: string[];
  refWords: string[];

  entryStack = [];
  autoSaveOnLeave = true;

  sortMeaningItems = false;
  deleteItems = false;

  editing = false;
  editingMeanings: SimpleMeaning[] = null;
  editingItem: SimpleMeaning = null;
  newItem: SimpleMeaning = null;
  posOptions = null;


  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    this.cdr = cdr;
    this.dictService = dictService;
  }

  ngOnInit() {
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
    // console.log('word: ' + entry.word);
    // console.log('created at: ' + Model.createdTimeString(entry));
    // console.log('updated at: ' + Model.updatedTimeString(entry));

    this.categoryTags = DictEntry.EvaluateCategoryTags(entry.categories);
    this.refWords = null;
    let refWords = union(entry.baseForm ? [entry.baseForm] : null, this.relatedWords);
    if (refWords.length > 0) {
      let previous = last(this.entryStack);
      if (previous) {
        refWords = refWords.filter(w => w !== previous);
      }
      if (refWords.length > 0) {
        this.refWords = refWords;
      }
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
    let pm = this.editingItem;
    if (pm && pt[pm.pos]) {
      merged = pt[pm.pos].concat(merged);
    }
    return merged;
  }

  get tagLabelMap() {
    return TagLabelMap;
  }

  startEditing() {
    if (this.entry.simple) {
      //deep clone
      this.editingMeanings =
        JSON.parse(JSON.stringify(this.entry.simple));
    } else {
      this.editingMeanings = [];
    }
    this.editing = true;
  }

  private _endEditing() {
    this.editing = false;
    this.editingMeanings = null;
    this.editingItem = null;
    this.newItem = null;
  }

  saveEdit(entry?, thenGotoWord?: string) {
    if (!entry) {
      entry = this.entry
    }

    let em = this.editingMeanings;

    let oriMeanings = entry.simple;
    let ori = JSON.stringify(oriMeanings);
    let current = JSON.stringify(em);
    if (current == ori) {
      this._endEditing();
      return;
    }
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


  private swapArrayElements(arr, index1, index2) {
    if (index1 < 0 || index2 >= arr.length) {
      return;
    }
    let t = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = t;
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

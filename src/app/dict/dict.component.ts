import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {DictEntry, PosMeanings, MeaningItem} from '../models/dict-entry';
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

  private static _POS = [
    {abbr: 'n.', name: 'n. 名词'},
    {abbr: 'v.', name: 'v. 动词'},
    {abbr: 'adj.', name: 'adj. 形容词'},
    {abbr: 'adv.', name: 'adv. 副词'},
    {abbr: 'prep.', name: 'prep. 介词'},
    {abbr: 'pron.', name: 'pron. 代词'},
    {abbr: 'conj.', name: 'conj. 连词'},
    {abbr: 'int.', name: 'int. 感叹词'},
    {abbr: 'other', name: 'other...'},
  ];
  posOptions = null;


  private _posTags = {
    common: [
      {value: 'idiom', label: '习语'},
      {value: 'colloquial', label: '口语'},
      {value: 'figurative', label: '比喻'},
      {value: 'slang', label: '俚语'},
      {value: 'euphemism', label: '委婉'}
    ],
    'n.': [
      {value: 'individual', label: '个体'},
      {value: 'collective', label: '集体'},
      {value: 'material', label: '物质'},
      {value: 'abstract', label: '抽象'},
      {value: 'countable', label: '可数'},
      {value: 'uncountable', label: '不可数'},
      {value: 'singular', label: '单数'},
      {value: 'countable', label: '复数'},
      {value: 'gerund', label: '动名词'},
      {value: 'proper', label: '专有'}
    ],
    'v.': [
      {value: 'transitive', label: 'vt.'},
      {value: 'intransitive', label: 'vi.'},
      {value: 'ergative', label: 'vi.&vt.'},
      {value: 'link', label: '系动词'},
      {value: 'modal', label: '情态'},
      {value: 'ditransitive', label: '双宾'},
      {value: 'irregular', label: '不规则'},
      {value: 'instantaneous', label: '短暂'}
    ]
  };

  private _tagLabelMap = null;

  dictSearch = (key: string) => {
    key = key.trim();
    let o = this.dictService.search(key);
    return o.toPromise();
  };

  constructor(private dictService: DictService,
              private router: Router) {
  }

  get categories() {
    return this.entry.categories;
  }

  get posTags() {
    let pt = this._posTags;
    let merged = pt.common;
    let pm = this.editingPosMeanings;
    if (pm && pt[pm.pos]) {
      merged = pt[pm.pos].concat(merged);
    }
    return merged;
  }

  get tagLabelMap() {
    if (this._tagLabelMap == null) {
      let tm = this._tagLabelMap = {};
      for (let pos in this._posTags) {
        let tags = this._posTags[pos];
        if (tags) {
          for (let tag of tags) {
            tm[tag.value] = tag.label;
          }
        }
      }
    }
    return this._tagLabelMap;
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
    this.posOptions = DictComponent._POS
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

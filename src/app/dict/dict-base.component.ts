import {
  Input, OnInit, OnChanges,
  SimpleChanges, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import {union, last} from 'lodash';

import {DictEntry, TagLabelMap} from '../models/dict-entry';
import {DictService} from '../services/dict.service';

export abstract class DictBaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() entry: DictEntry;
  @Input() relatedWords: string[];
  @Input() autoEnterEditing;
  @Input() autoSaveOnLeave;
  cdr: ChangeDetectorRef;
  dictService: DictService;
  categoryTags: string[];
  refWords: string[];

  entryStack = [];

  editing = false;

  tagLabelMap = TagLabelMap;

  protected constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    this.cdr = cdr;
    this.dictService = dictService;
  }

  ngOnInit() {
    if (this.autoEnterEditing) {
      this.startEditing();
    }
  }

  ngOnDestroy() {
    if (this.editing) {
      this.checkToSave(this.entry);
    }
  }

  protected checkToSave(entry) {
    if (!this.editing) {
      return;
    }
    if (this.autoSaveOnLeave) {
      this.saveEdit(entry);
      return;
    }
    if (!this.everEdited(entry)) {
      return;
    }
    if (confirm('尚未保存！要先保存吗？')) {
      this.saveEdit(entry);
    }
  }

  abstract startEditing();

  abstract saveEdit(entry?, thenGotoWord?: string);

  abstract cancelEdit();

  abstract everEdited(oriEntry): boolean;

  protected pushPreviousIfNeeded(pre) {
    if (pre) {
      this.entryStack.push(pre);
      this.checkToSave(pre);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entry) {
      this.pushPreviousIfNeeded(changes.entry.previousValue);
      this.onEntryChanged();
    }
  }

  protected resetRefWords() {
    this.refWords = null;
    let entry = this.entry;
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
  }

  protected onEntryChanged() {
    let entry = this.entry;
    // console.log('word: ' + entry.word);
    // console.log('created at: ' + Model.createdTimeString(entry));
    // console.log('updated at: ' + Model.updatedTimeString(entry));

    this.categoryTags = DictEntry.EvaluateCategoryTags(entry.categories);
    this.resetRefWords();
    if (this.autoEnterEditing) {
      this.startEditing();
    }
    this.cdr.detectChanges();
  }

  protected _gotoWord(word: string) {
    this.dictService.getEntry(word)
      .subscribe(e => {
          if (!e) {
            return;
          }
          this.entryStack.push(this.entry);
          this.entry = e;
          if (this.autoEnterEditing) {
            this.startEditing();
          }
          this.onEntryChanged();
        }
      );
  }

  goto(word: string) {
    this.checkToSave(this.entry);
    this._gotoWord(word);
  }

  goback() {
    if (this.entryStack.length > 0) {
      this.entry = this.entryStack.pop();
      if (this.autoEnterEditing) {
        this.startEditing();
      }
      this.onEntryChanged();
    }
  }


  protected stopEvent($event) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
  }

  protected swapArrayElements(arr, index1, index2) {
    if (index1 < 0 || index2 >= arr.length) {
      return;
    }
    let t = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = t;
  }
}

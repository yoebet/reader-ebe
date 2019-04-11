import {
  Component, Output, EventEmitter,
  AfterViewChecked, ChangeDetectorRef, Input, SimpleChanges
} from '@angular/core';

import {DictService} from '../services/dict.service';
import {DictSelectedResult} from '../content-types/dict-request';
import {SelectedItem} from "../content-types/dict-request";
import {DictBaseComponent} from "./dict-base.component";
import {DictEntry, MeaningItem, SimpleMeaning} from "../models/dict-entry";

@Component({
  selector: 'dict-entry-smi',
  templateUrl: './dict-entry-smi.component.html',
  styleUrls: ['./dict-entry-smi.component.css']
})
export class DictEntrySmiComponent extends DictBaseComponent implements AfterViewChecked {
  @Input() initialSelectedItem: SelectedItem;
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter<DictSelectedResult>();

  viewReadyEntry = null;
  initialWord: string;
  selectedItem: SelectedItem;


  get selectedChanged() {
    let si = this.selectedItem;
    let isi = this.initialSelectedItem;
    if (this.entry.word === this.initialWord) {
      if (!si) {
        return false;
      }
      if (!isi) {
        return true;
      }
      return si.pos !== isi.pos || si.meaning !== isi.meaning;
    }
    return si && si.meaning;
  }

  constructor(cdr: ChangeDetectorRef, dictService: DictService) {
    super(cdr, dictService);
  }


  ngAfterViewChecked() {
    if (this.viewReadyEntry === this.entry) {
      return;
    }
    this.viewReady.emit();
    this.viewReadyEntry = this.entry;
  }

  ngOnInit() {
    super.ngOnInit();
    this.initialWord = this.entry.word;
    let isi = this.initialSelectedItem;
    if (isi) {
      this.selectedItem = {pos: isi.pos, meaning: isi.meaning};
    } else {
      this.selectedItem = null;
    }
  }

  startEditing() {
  }

  saveEdit(entry?, thenGotoWord?: string) {
  }

  cancelEdit() {
  }

  everEdited(oriEntry): boolean {
    return false;
  }

  onEntryChanged() {
    let entry = this.entry;
    this.categoryTags = DictEntry.EvaluateCategoryTags(entry.categories);
    this.resetRefWords();
    if (entry.word === this.initialWord) {
      let isi = this.initialSelectedItem;
      if (isi) {
        this.selectedItem = {pos: isi.pos, meaning: isi.meaning};
      } else {
        this.selectedItem = null;
      }
    } else {
      this.selectedItem = null;
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entry) {
      this.entryStack = [];
      this.onEntryChanged();
    }
  }


  clickMeaningItem(pos, mi: MeaningItem | SimpleMeaning | string) {
    let exp = (typeof mi === 'string') ? mi : mi.exp;
    if (this.selectedItem && pos == this.selectedItem.pos && exp === this.selectedItem.meaning) {
      this.selectedItem.meaning = null;
    } else {
      this.selectedItem = {pos, meaning: exp};
    }
  }

  cancelSelect() {
    this.dictItemSelected.emit(null);
  }

  doneSelect() {
    if (!this.selectedChanged) {
      this.dictItemSelected.emit(null);
      return;
    }
    let {pos, meaning} = this.selectedItem;
    let selectedResult: DictSelectedResult = {pos, meaning, word: this.entry.word};
    this.dictItemSelected.emit(selectedResult);
  }

}

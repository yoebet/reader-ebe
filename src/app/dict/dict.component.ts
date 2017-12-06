import {Component, ChangeDetectorRef} from '@angular/core';

import {DictEntry} from '../models/dict-entry';
import {DictService} from '../services/dict.service';

import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'dict-main',
  templateUrl: './dict.component.html',
  styleUrls: ['./dict.component.css']
})
export class DictComponent {
  entry: DictEntry;

  dictSearch = (key: string) => {
    key = key.trim();
    let o = this.dictService.search(key);
    return o.toPromise();
  };

  constructor(/*private cdr: ChangeDetectorRef, */private dictService: DictService) {
  }

  get entryHistory(): DictEntry[] {
    return this.dictService.entryHistory;
  }

  selectEntry(entrySimple) {
    this.dictService.getEntry(entrySimple._id)
      .subscribe(e => {
          this.entry = e;
        }
      );
  }

  selectHistoryEntry(entry) {
    this.entry = entry;
    // this.cdr.detectChanges();
  }

  // onUpdate(updated) {
  //   let index = this.entryHistory
  //     .findIndex(eh => eh.word === updated.word);
  //   if (index >= 0) {
  //     this.entryHistory[index] = updated;
  //   }
  //   if (this.entry._id === updated._id) {
  //     this.entry = updated;
  //   }
  // }

}

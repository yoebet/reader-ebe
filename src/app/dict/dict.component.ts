import {Component} from '@angular/core';
import {Router} from '@angular/router';

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

  entryHistory: DictEntry[] = [];


  dictSearch = (key: string) => {
    key = key.trim();
    let o = this.dictService.search(key);
    return o.toPromise();
  };

  constructor(private dictService: DictService,
              private router: Router) {
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

  onUpdate(updated) {
    let index = this.entryHistory
      .findIndex(eh => eh.word === updated.word);
    if (index >= 0) {
      this.entryHistory[index] = updated;
    }
    if (this.entry._id === updated._id) {
      this.entry = updated;
    }
  }

}

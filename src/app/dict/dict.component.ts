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
  phrase = false;
  phraseOnly = false;
  cet = false;
  junior = false;

  get searchOptions(): any {
    return {
      phrase: this.phrase,
      phraseOnly: this.phraseOnly,
      junior: this.junior,
      cet: !this.junior && this.cet
    };
  }

  dictSearch = (key: string) => {
    key = key.trim();
    let o = this.dictService.search(key, this.searchOptions);
    return o.toPromise();
  };

  constructor(private dictService: DictService) {
  }

  get entryHistory(): DictEntry[] {
    return this.dictService.entryHistory;
  }

  selectEntry(entrySimple) {
    this.dictService.getEntry(entrySimple.word)
      .subscribe(e => {
          this.entry = e;
        }
      );
  }

  selectHistoryEntry(entry) {
    this.entry = entry;
    // this.cdr.detectChanges();
  }


  private loadAdjacentOne(direction: string) {
    if (!this.entry) {
      return;
    }
    let so = this.searchOptions;
    if (direction === 'next') {
      so.next = true;
    } else {
      so.previous = true;
    }
    so.limit = 1;
    so.allFields = true;
    let key = this.entry.word;
    this.dictService.search(key, so)
      .subscribe(es => {
          if (es.length > 0) {
            this.entry = es[0];
          }
        }
      );
  }

  loadNextEntry() {
    this.loadAdjacentOne('next');
  }

  loadPreviousEntry() {
    this.loadAdjacentOne('previous');
  }

  clearHistory() {
    this.dictService.clearCache();
  }

}

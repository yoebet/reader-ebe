import {Component, ViewChild} from '@angular/core';
import 'rxjs/add/operator/toPromise';
import {SuiSearch} from "ng2-semantic-ui/dist/modules/search/components/search";

import {DictZh} from '../models/dict-zh';
import {DictZhService} from '../services/dict-zh.service';


@Component({
  selector: 'dict-zh-main',
  templateUrl: './dict-zh.component.html',
  styleUrls: ['./dict-zh.component.css']
})
export class DictZhComponent {
  @ViewChild('searchInput', {read: SuiSearch}) searchInput: SuiSearch<any>;
  entry: DictZh;


  dictSearch = (key: string) => {
    let o = this.dictService.search(key.trim());
    return o.toPromise();
  };

  constructor(private dictService: DictZhService) {
  }

  get entryHistory(): DictZh[] {
    return this.dictService.entryHistory;
  }

  selectSearchResult(entrySimple) {
    let options: any = {};
    this.dictService.getEntry(entrySimple.word, options)
      .subscribe(e => {
          this.entry = e;
        }
      );
  }

  resetSearch() {
    this.searchInput.optionsLookup = this.dictSearch;
  }

  onSearchInputKeyup($event) {
    if ($event.which !== 13) {
      return;
    }
    let searchInput = this.searchInput;
    let results = searchInput.results;
    let query = searchInput.query;
    for (let entry of results) {
      if (entry.word === query) {
        searchInput.select(entry);
        break;
      }
    }
  }

  selectHistoryEntry(entry) {
    this.entry = entry;
  }

  clearHistory() {
    this.dictService.clearCache();
  }

}

import {Component, ViewChild} from '@angular/core';

import {DictEntry, DictFields} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {SuiSearch} from 'ng2-semantic-ui/dist/modules/search/components/search';

import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'dict-main',
  templateUrl: './dict.component.html',
  styleUrls: ['./dict.component.css']
})
export class DictComponent {
  @ViewChild('searchInput', {read: SuiSearch}) searchInput: SuiSearch<any>;
  entry: DictEntry;
  editSimple = true;
  autoEnterEditing = false;
  autoSaveOnLeave = true;

  phrase = false;
  phraseOnly = false;
  simpleEdited = 'All';
  wordScope = 'All';

  get searchOptions(): any {
    let options: any = {
      phrase: this.phrase && !this.phraseOnly,
      phraseOnly: this.phraseOnly
    };
    if (!this.phraseOnly) {
      for (let category of ['basic', 'cet', 'gre']) {
        if (this.wordScope === category) {
          options[category] = true;
          break;
        }
      }
    }
    let se = this.simpleEdited;
    if (se === 'y' || se === 'n') {
      options.simpleEdited = se;
    }
    return options;
  }

  dictSearch = (key: string) => {
    let o = this.dictService.search(key.trim(), this.searchOptions);
    return o.toPromise();
  };

  constructor(private dictService: DictService,
              private route: ActivatedRoute) {
    route.data.subscribe(data => {
      let es = data['editSimple'];
      if (typeof es === 'boolean') {
        this.editSimple = es;
      }
    });
  }

  get entryHistory(): DictEntry[] {
    return this.dictService.entryHistory;
  }

  selectSearchResult(entrySimple) {
    let options: any = {};
    if (this.editSimple) {
      options.fields = DictFields.SIMPLE;
    }
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
    if (this.editSimple || typeof this.entry.complete !== 'undefined') {
      this.entry = entry;
      return;
    }
    this.dictService.getEntry(entry.word, {fields: DictFields.COMPLETE})
      .subscribe(e => {
          this.entry = e;
        }
      );
  }

  switchComplete() {
    this.editSimple = false;
    if (this.entry && typeof this.entry.complete === 'undefined') {
      this.dictService.getEntry(this.entry.word, {fields: DictFields.COMPLETE})
        .subscribe(e => {
            this.entry = e;
          }
        );
    }
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
    so.fields = this.editSimple ? DictFields.SIMPLE : DictFields.COMPLETE;
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
    this.dictService.clearHistory();
  }

}

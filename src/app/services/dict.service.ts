import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {DictEntry, DictFields} from '../models/dict-entry';
import {BaseService} from './base.service';
import {OpResult} from '../models/op-result';
import {SuiModalService} from "ng2-semantic-ui";

@Injectable()
export class DictService extends BaseService<DictEntry> {

  private _entryHistory: DictEntry[] = [];
  private entryCache: Map<string, DictEntry> = new Map();
  private norefEntryCache: Map<string, DictEntry> = new Map();

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/dict`;
  }

  clearCache() {
    this.entryCache.clear();
    this.norefEntryCache.clear();
    this._entryHistory = [];
  }

  search(key: string, options: any = {}): Observable<DictEntry[]> {
    let {limit, previous, next, fields, simpleEdited} = options;
    if (next === true) {
      key = key + '_';
    } else if (previous === true) {
      key = '_' + key;
    }
    if (!limit) {
      limit = 8;
    }
    let url = `${this.baseUrl}/search/${key}?limit=${limit}`;

    let switches = ['phrase', 'phraseOnly', 'basic', 'cet', 'gre']
      .filter(name => options[name]);
    if (switches.length > 0) {
      url += '&';
      url += switches.join('&');
    }
    if (fields) {
      url += '&fields=' + fields;
    }
    if (simpleEdited) {
      url += '&simpleEdited=' + simpleEdited;
    }

    let obs = this.list(url);
    if (fields !== DictFields.COMPLETE) {
      return obs;
    }

    return this.cacheList(obs);
  }

  get entryHistory(): DictEntry[] {
    return this._entryHistory;
  }

  private pushHistory(entry) {
    let eh = this._entryHistory;
    let inHistory = eh.find(e => e.word === entry.word);
    if (!inHistory) {
      eh.push(entry);
    }
    if (eh.length > 10) {
      eh.shift();
    }
  }

  private updateCache(entry, withRefFields = true) {
    let cache = withRefFields ? this.entryCache : this.norefEntryCache;
    cache.set(entry._id, entry);
    cache.set(entry.word, entry);
  }

  private cacheOne(obs: Observable<DictEntry>, withRefFields): Observable<DictEntry> {
    obs = obs.share();
    obs.subscribe(entry => {
      if (entry) {
        if (withRefFields) {
          this.pushHistory(entry);
        }
        this.updateCache(entry, withRefFields);
      }
    });
    return obs;
  }

  private cacheList(obs: Observable<DictEntry[]>, withRefFields = true): Observable<DictEntry[]> {
    obs = obs.share();
    obs.subscribe(entries => {
      for (let entry of entries) {
        if (withRefFields) {
          this.pushHistory(entry);
        }
        this.updateCache(entry, withRefFields);
      }
    });
    return obs;
  }

  getEntry(idOrWord: string, options: any = {}): Observable<DictEntry> {
    let cachedEntry = this.entryCache.get(idOrWord);
    if (!cachedEntry && options.noref) {
      cachedEntry = this.norefEntryCache.get(idOrWord);
    }
    if (cachedEntry) {
      return Observable.of(cachedEntry);
    }
    let url = `${this.baseUrl}/${idOrWord}`;
    let addedParam = false;
    if (!DictEntry.isId(idOrWord)) {
      let switches = ['lotf', 'base', 'stem'].filter(name => options[name]);
      if (switches.length > 0) {
        url += '?';
        url += switches.join('&');
        addedParam = true;
      }
    }
    if (options.noref) {
      url += addedParam ? '&' : '?';
      url += 'noref';
      addedParam = true;
    }
    if (options.fields) {
      url += addedParam ? '&' : '?';
      url += 'fields=' + options.fields;
      addedParam = true;
    }

    let obs = this.getOneByUrl(url);
    if (options.fields && options.fields !== DictFields.COMPLETE) {
      return obs;
    }

    return this.cacheOne(obs, !options.noref);
  }


  update(entry: DictEntry): Observable<OpResult> {
    this.entryCache.delete(entry._id);
    this.entryCache.delete(entry.word);
    this.norefEntryCache.delete(entry._id);
    this.norefEntryCache.delete(entry.word);
    return super.update(entry);
  }

}

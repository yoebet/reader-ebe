import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {DictEntry} from '../models/dict-entry';
import {BaseService} from './base.service';
import {OpResult} from '../models/op-result';

@Injectable()
export class DictService extends BaseService<DictEntry> {

  private _entryHistory: DictEntry[] = [];
  private entryCache: Map<string, DictEntry> = new Map();

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}dict`;
  }

  search(key: string, options?): Observable<DictEntry[]> {
    let {limit, previous, next, allFields} = options;
    if (next === true) {
      key = key + '_';
    } else if (previous === true) {
      key = '_' + key;
    }
    if (!limit) {
      limit = 8;
    }
    let url = `${this.baseUrl}/search/${key}?limit=${limit}`;

    let switches = ['phrase', 'phraseOnly', 'cet', 'junior', 'allFields']
      .filter(name => options[name]);
    if (switches.length > 0) {
      url += '&';
      url += switches.join('&');
    }

    let obs = this.list(url);
    if (allFields !== true) {
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

  private updateCache(entry) {
    this.entryCache.set(entry._id, entry);
    this.entryCache.set(entry.word, entry);
  }

  private isId(idOrWord): boolean {
    return /^[0-9a-z]{24}$/.test(idOrWord);
  }

  private cacheOne(obs: Observable<DictEntry>): Observable<DictEntry> {
    obs = obs.share();
    obs.subscribe(entry => {
      if (entry) {
        this.pushHistory(entry);
        this.updateCache(entry);
      }
    });
    return obs;
  }

  private cacheList(obs: Observable<DictEntry[]>): Observable<DictEntry[]> {
    obs = obs.share();
    obs.subscribe(entries => {
      for (let entry of entries) {
        this.pushHistory(entry);
        this.updateCache(entry);
      }
    });
    return obs;
  }

  getEntry(idOrWord: string, options: any = {}): Observable<DictEntry> {
    let cachedEntry = this.entryCache.get(idOrWord);
    if (cachedEntry) {
      return Observable.of(cachedEntry);
    }
    let url = `${this.baseUrl}/${idOrWord}`;
    if (!this.isId(idOrWord)) {
      let switches = ['lotf', 'base', 'stem'].filter(name => options[name]);
      if (switches.length > 0) {
        url += '?';
        url += switches.join('&');
      }
    }

    return this.cacheOne(this.getOneByUrl(url));
  }


  update(entry: DictEntry): Observable<OpResult> {
    this.entryCache.delete(entry._id);
    this.entryCache.delete(entry.word);
    return super.update(entry);
  }

}

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {DictEntry} from '../models/dict-entry';
import {BaseService} from './base.service';

@Injectable()
export class DictService extends BaseService<DictEntry> {

  private _entryHistory: DictEntry[] = [];
  private entryCache: Map<string, DictEntry> = new Map();

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}dict`;
  }

  search(key: string): Observable<DictEntry[]> {
    if (!/^[a-zA-Z]/.test(key)) {
      return Observable.of([]);
    }
    let url = `${this.baseUrl}/search/${key}?limit=7`;
    return this.list(url);
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

    let obs = this.getOneByUrl(url).share();

    obs.subscribe(entry => {
      if (entry) {
        this.pushHistory(entry);
        this.updateCache(entry);
      }
    });

    return obs;
  }

}

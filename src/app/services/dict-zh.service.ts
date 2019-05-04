import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {of as observableOf, Observable} from 'rxjs';
import {map, tap, catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {DictHistoryCapacity} from '../config';
import {environment} from '../../environments/environment';
import {ZhPhrases} from '../anno/zh-phrases';
import {DictZh} from '../models/dict-zh';
import {BaseService} from './base.service';

@Injectable()
export class DictZhService extends BaseService<DictZh> {
  private _entryHistory: DictZh[] = [];
  private entryCache: Map<string, DictZh> = new Map();
  private phrases: ZhPhrases;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/dict_zh`;
  }

  clearCache() {
    this.entryCache.clear();
    this._entryHistory = [];
  }

  get entryHistory(): DictZh[] {
    return this._entryHistory;
  }

  private pushHistory(entry) {
    let eh = this._entryHistory;
    let inHistory = eh.find(e => e.word === entry.word);
    if (!inHistory) {
      eh.push(entry);
    }
    if (eh.length > DictHistoryCapacity) {
      eh.shift();
    }
  }

  private updateCache(entry) {
    this.entryCache.set(entry._id, entry);
    this.entryCache.set(entry.word, entry);
  }

  search(key: string, options: any = {}): Observable<DictZh[]> {
    let {limit} = options;
    if (!limit) {
      limit = 8;
    }
    let url = `${this.baseUrl}/search/${key}?limit=${limit}`;
    return this.list(url);
  }

  getEntry(idOrWord: string, options: any = {}): Observable<DictZh> {
    let cachedEntry = this.entryCache.get(idOrWord);
    if (cachedEntry) {
      return observableOf(cachedEntry);
    }
    let {cl} = options;
    if (cl !== false) {
      cl = true;
    }
    let url = `${this.baseUrl}/${idOrWord}`;
    if (cl) {
      url += '?cl';
    }
    return this.getOneByUrl(url).pipe(
      tap(entry => {
        if (entry) {
          this.pushHistory(entry);
          this.updateCache(entry);
        }
      }));
  }

  getPhrases(): Observable<ZhPhrases> {
    if (this.phrases) {
      return observableOf(this.phrases);
    }
    let url = `${this.baseUrl}/phrases/all`;
    return this.http.get<string[]>(url, this.httpOptions)
      .pipe(
        map(words => {
          this.phrases = new ZhPhrases(words);
          return this.phrases;
        }),
        catchError(this.handleError));
  }

}

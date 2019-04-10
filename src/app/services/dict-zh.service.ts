import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {SuiModalService} from "ng2-semantic-ui";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {environment} from '../../environments/environment';
import {DictZh} from '../models/dict-zh';
import {BaseService} from './base.service';

@Injectable()
export class DictZhService extends BaseService<DictZh> {
  private _entryHistory: DictZh[] = [];
  private entryCache: Map<string, DictZh> = new Map();

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
    if (eh.length > 10) {
      eh.shift();
    }
  }

  private updateCache(entry) {
    this.entryCache.set(entry._id, entry);
    this.entryCache.set(entry.word, entry);
  }

  private cacheOne(obs: Observable<DictZh>): Observable<DictZh> {
    obs = obs.share();
    obs.subscribe(entry => {
      if (entry) {
        this.pushHistory(entry);
        this.updateCache(entry);
      }
    });
    return obs;
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
    let {cl} = options;
    if (cl !== false) {
      cl = true;
    }
    let url = `${this.baseUrl}/${idOrWord}`;
    if (cl) {
      url += '?cl'
    }
    return this.cacheOne(this.getOneByUrl(url));

  }
}

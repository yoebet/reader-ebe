import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/of';

import {DictEntry} from '../models/dict-entry';
import {BaseService} from './base.service';

@Injectable()
export class DictService extends BaseService<DictEntry> {

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

  getEntry(word: string): Observable<DictEntry> {
    return this.getOne(word);
  }

}

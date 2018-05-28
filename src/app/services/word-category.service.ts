import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import {BaseService} from './base.service';
import {WordCategory} from "../models/word-category";

@Injectable()
export class WordCategoryService extends BaseService<WordCategory> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/word_categories`;
  }

  fetchSampleWords(code, options: any = {}): Observable<string[]> {
    let url = `${this.baseUrl}/${code}/sample`;
    if (options.limit) {
      url = url + '?limit=' + options.limit;
    }
    if (options.offset) {
      url = url + options.limit ? '&' : '?';
      url = url + 'offset=' + options.offset;
    }
    return this.http.post<string[]>(url, null, this.httpOptions)
      .catch(this.handleError);
  }

}

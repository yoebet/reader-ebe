import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import {SorterService} from './sorter.service';
import {WordCategory} from "../models/word-category";
import {SuiModalService} from "ng2-semantic-ui";

@Injectable()
export class WordCategoryService extends SorterService<WordCategory> {

  userBaseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/word_categories`;
    this.userBaseUrl = `${apiBase}/${this.apiB}/word_categories`;
  }

  fetchSampleWords(code, options: any = {}): Observable<string[]> {
    let url = `${this.userBaseUrl}/${code}/sample`;
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

  calculateWordCount(code): Observable<any> {
    let url = `${this.baseUrl}/${code}/calculateWordCount`;
    return this.http.post<string[]>(url, null, this.httpOptions)
      .catch(this.handleError);
  }

}

import {catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SuiModalService} from 'ng2-semantic-ui';

import {Observable} from 'rxjs/';

import {environment} from '../../environments/environment';
import {SorterService} from './sorter.service';
import {WordCategory} from '../models/word-category';
import {SessionService} from './session.service';

@Injectable()
export class WordCategoryService extends SorterService<WordCategory> {

  userBaseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
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
    return this.http.post<string[]>(url, null, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  calculateWordCount(code): Observable<any> {
    let url = `${this.baseUrl}/${code}/calculateWordCount`;
    return this.http.post<string[]>(url, null, this.httpOptions).pipe(
      catchError(this.handleError));
  }

}

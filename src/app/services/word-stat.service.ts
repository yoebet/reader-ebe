import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SuiModalService } from 'ng2-semantic-ui';
import { Observable } from 'rxjs/';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { WordStat } from '../models/word-stat';
import { SessionService } from './session.service';
import { environment } from '../../environments/environment';

@Injectable()
export class WordStatService extends BaseService<WordStat> {

  bookStatBaseUrl: string;
  chapStatBaseUrl: string;

  constructor(protected http: HttpClient,
              protected sessionService: SessionService,
              protected modalService: SuiModalService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.bookStatBaseUrl = `${apiBase}/${this.apiB}/books`;
    this.chapStatBaseUrl = `${apiBase}/${this.apiB}/chaps`;
  }


  getBookStat(bookId: string): Observable<WordStat> {
    const url = `${this.bookStatBaseUrl}/${bookId}/wordStat`;
    return super.getOneByUrl(url);
  }

  getBookWordsForCat(bookId: string, cat: string): Observable<string[]> {
    const url = `${this.bookStatBaseUrl}/${bookId}/words/${cat}`;
    return this.http.get<string[]>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  getChapStat(chapId: string): Observable<WordStat> {
    const url = `${this.chapStatBaseUrl}/${chapId}/wordStat`;
    return super.getOneByUrl(url);
  }

  getMultiBookStats(bookIds: string[]): Observable<WordStat[]> {
    const url = `${this.chapStatBaseUrl}/stats/multiBooks`;
    return this.http.post<WordStat[]>(url, bookIds, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  getChapsStats(bookId: string): Observable<WordStat[]> {
    const url = `${this.chapStatBaseUrl}/${bookId}/chapsStats`;
    return super.list(url);
  }

  getChapWordsForCat(chapId: string, cat: string): Observable<string[]> {
    const url = `${this.chapStatBaseUrl}/${chapId}/words/${cat}`;
    return this.http.get<string[]>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

}

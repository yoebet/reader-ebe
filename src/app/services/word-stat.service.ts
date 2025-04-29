import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SuiModalService} from 'ng2-semantic-ui';
import {Observable} from 'rxjs/';
import {catchError} from 'rxjs/operators';
import {BaseService} from './base.service';
import {WordStat} from '../models/word-stat';
import {SessionService} from './session.service';
import {environment} from '../../environments/environment';

@Injectable()
export class WordStatService extends BaseService<WordStat> {

  getStatBaseUrl: string;
  buildStatBaseUrl: string;

  constructor(protected http: HttpClient,
              protected sessionService: SessionService,
              protected modalService: SuiModalService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.getStatBaseUrl = `${apiBase}/${this.apiB}`;
    this.buildStatBaseUrl = `${apiBase}/${this.apiA}`;
  }


  getBookStat(bookId: string): Observable<WordStat> {
    const url = `${this.getStatBaseUrl}/books/${bookId}/wordStat`;
    return super.getOneByUrl(url);
  }

  getBookWordsForCat(bookId: string, cat: string): Observable<string[]> {
    const url = `${this.getStatBaseUrl}/books/${bookId}/words/${cat}`;
    return this.http.get<string[]>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  getChapStat(chapId: string): Observable<WordStat> {
    const url = `${this.getStatBaseUrl}/chaps/${chapId}/wordStat`;
    return super.getOneByUrl(url);
  }

  getChapWordsForCat(chapId: string, cat: string): Observable<string[]> {
    const url = `${this.getStatBaseUrl}/chaps/${chapId}/words/${cat}`;
    return this.http.get<string[]>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }


  buildBookStat(bookId: string): Observable<WordStat> {
    const url = `${this.buildStatBaseUrl}/books/${bookId}/wordStat/rebuild`;
    return super.postForModel(url);
  }

  buildChapStat(chapId: string): Observable<WordStat> {
    const url = `${this.buildStatBaseUrl}/chaps/${chapId}/wordStat/rebuild`;
    return super.postForModel(url);
  }

}

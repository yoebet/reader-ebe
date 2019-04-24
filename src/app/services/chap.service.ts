import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {Chap} from '../models/chap';
import {OpResult} from '../models/op-result';

import {SorterService} from './sorter.service';


@Injectable()
export class ChapService extends SorterService<Chap> {

  protected bookBaseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.bookBaseUrl = `${apiBase}/${this.apiA}/books`;
    this.baseUrl = `${apiBase}/${this.apiA}/chaps`;
  }

  create(chap: Chap): Observable<Chap> {
    let bookId = chap.bookId;
    const url = `${this.bookBaseUrl}/${bookId}/chaps`;
    return this.http.post<Chap>(url, chap, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  buildContentPack(chapId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${chapId}/buildChapPack`;
    return this.postForOpResult(url);
  }

  dropContentPack(chapId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${chapId}/dropChapPack`;
    return this.postForOpResult(url);
  }
}


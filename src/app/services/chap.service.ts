import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import {Chap} from '../models/chap';
import {SorterService} from './sorter.service';

@Injectable()
export class ChapService extends SorterService<Chap> {

  protected bookBaseUrl: string;

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.bookBaseUrl = `${apiBase}books`;
    this.baseUrl = `${apiBase}chaps`;
  }

  create(chap: Chap): Observable<Chap> {

    let bookId = chap.bookId;
    const url = `${this.bookBaseUrl}/${bookId}/chaps`;
    return this.http.post<Chap>(url, chap, this.httpOptions)
      .catch(this.handleError);
  }
}


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Book} from '../models/book';
import {SorterService} from './sorter.service';
import {Observable} from "rxjs/Observable";
import {SuiModalService} from "ng2-semantic-ui";

@Injectable()
export class BookService extends SorterService<Book> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/books`;
  }


  backup(bookId: string): Observable<Book> {
    let url = `${this.baseUrl}/${bookId}/backup`;
    return this.http.post<Book>(url, null, this.httpOptions)
      .catch(this.handleError);
  }

}

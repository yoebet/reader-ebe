import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SuiModalService} from 'ng2-semantic-ui';

import {catchError} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';

import {environment} from '../../environments/environment';
import {SorterService} from './sorter.service';
import {BookCategory} from '../models/book-category';
import {BookBasic} from '../models/book';

@Injectable()
export class BookCategoryService extends SorterService<BookCategory> {


  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/book_categories`;
  }


  listOptions(): Observable<BookCategory[]> {
    let url = `${this.baseUrl}/list/options`;
    return super.list(url);
  }

  findBooks(cat: string): Observable<BookBasic[]> {
    let url = `${this.baseUrl}/${cat}/booksBasic`;
    return this.http.get<BookBasic[]>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

}

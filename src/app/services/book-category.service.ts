import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SuiModalService} from 'ng2-semantic-ui';

import {catchError, map, switchMap} from 'rxjs/operators';
import {Observable, of as ObservableOf} from 'rxjs/';

import {environment} from '../../environments/environment';
import {SorterService} from './sorter.service';
import {BookCategory} from '../models/book-category';
import {BookBasic} from '../models/book';
import {SessionService} from './session.service';

@Injectable()
export class BookCategoryService extends SorterService<BookCategory> {

  private categoryNames: Record<string, string> = undefined;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/book_categories`;
  }

  getCategoryNames(): Observable<Record<string, string>> {
    if (this.categoryNames) {
      return ObservableOf(this.categoryNames);
    }
    return this.listOptions()
      .pipe(switchMap(cs => ObservableOf(this.categoryNames)));
  }


  listOptions(): Observable<BookCategory[]> {
    let url = `${this.baseUrl}/list/options`;
    return super.list(url)
      .pipe(map(cs => {
          if (!this.categoryNames) {
            this.categoryNames = {};
          }
          for (const c of cs) {
            this.categoryNames[c.code] = c.name;
          }
          return cs;
        })
      );
  }

  findBooks(cat: string): Observable<BookBasic[]> {
    let url = `${this.baseUrl}/${cat}/booksBasic`;
    return this.http.get<BookBasic[]>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

}

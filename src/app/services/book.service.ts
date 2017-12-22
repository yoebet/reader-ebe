import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

// import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/operator/share';

import {Book} from '../models/book';
import {SorterService} from './sorter.service';

@Injectable()
export class BookService extends SorterService<Book> {

  // allBooks: Book[];

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}books`;
  }

  // clearCache() {
  //   this.allBooks = null;
  // }
  //
  // list(): Observable<Book[]> {
  //   if (this.allBooks) {
  //     return Observable.of(this.allBooks);
  //   }
  //   let obs = super.list() as Observable<Book[]>;
  //   obs = obs.share();
  //   obs.subscribe(books => this.allBooks = books);
  //   return obs;
  // }

}

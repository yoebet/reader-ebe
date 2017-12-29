import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Book} from '../models/book';
import {SorterService} from './sorter.service';

@Injectable()
export class BookService extends SorterService<Book> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}books`;
  }

}

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {UserBook} from '../models/user-book';
import {BaseService} from './base.service';

@Injectable()
export class UserBookService extends BaseService<UserBook> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/user_books`;
  }

}

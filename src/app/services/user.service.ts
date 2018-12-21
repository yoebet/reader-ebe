import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import {User} from '../models/user';
import {UserBook} from '../models/user-book';
import {BaseService} from './base.service';
import {SuiModalService} from "ng2-semantic-ui";

@Injectable()
export class UserService extends BaseService<User> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/users`;
  }


  list(options): Observable<User[]> {
    let {from, limit, manager, name} = options;
    let url = `${this.baseUrl}?limit=${limit || 20}`;
    if (from) {
      url += `&from=${from}`;
    }
    if (name) {
      url += `&name=${name}`;
    }
    if (manager) {
      url += '&manager';
    }
    return super.list(url) as Observable<User[]>;
  }

  userBooks(userId: string): Observable<UserBook[]> {
    let url = `${this.baseUrl}/${userId}/books`;
    return this.http.get<UserBook[]>(url, this.httpOptions)
      .catch(this.handleError);
  }

}

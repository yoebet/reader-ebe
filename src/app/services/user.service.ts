import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/';
import {catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';
import {User, UserIdName} from '../models/user';
import {UserBook} from '../models/user-book';
import {OpResult} from '../models/op-result';

import {BaseService} from './base.service';
import {SessionService} from './session.service';

@Injectable()
export class UserService extends BaseService<User> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/users`;
  }


  list(options): Observable<User[]> {
    let {from, limit, manager, name, sortCT} = options;
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
    if (sortCT) {
      url += `&sortCT=${sortCT}`;
    }
    return super.list(url) as Observable<User[]>;
  }

  getByRc(rc): Observable<UserIdName> {
    let url = `${this.baseUrl}/getByRc/${rc}`;
    return this.http.get<UserIdName>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  userBooks(userId: string): Observable<UserBook[]> {
    let url = `${this.baseUrl}/${userId}/books`;
    return this.http.get<UserBook[]>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  addBooks(userId: string, ubs: { role?, bookIds: string[] }): Observable<OpResult> {
    let url = `${this.baseUrl}/${userId}/addBooks`;
    return this.postForOpResult(url, ubs);
  }

  getTempToken(userId: string): Observable<any> {
    let url = `${this.baseUrl}/${userId}/tempToken`;
    return this.http.get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  genTempToken(userId: string): Observable<any> {
    let url = `${this.baseUrl}/${userId}/tempToken`;
    return this.http.post<any>(url, null, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  refreshTempToken(userId: string): Observable<any> {
    let url = `${this.baseUrl}/${userId}/tempToken`;
    return this.http.put<any>(url, null, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  dropTempToken(userId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${userId}/tempToken`;
    return this.http.delete<OpResult>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

}

import {Injectable, EventEmitter} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {DefaultHttpHeaders} from '../config';
import {User} from '../models/user';
import {OpResult} from '../models/op-result';

@Injectable()
export class SessionService {

  private httpOptions = {
    headers: new HttpHeaders(DefaultHttpHeaders),
    withCredentials: true
  };

  private loginUrl: string;

  private wxAuthUrl: string;

  currentUser: User;

  readonly onCurrentUserChanged = new EventEmitter<{ from, to }>();

  constructor(private http: HttpClient) {
    let apiBase = environment.apiBase || '';
    this.loginUrl = `${apiBase}/api-b/login`;
    this.wxAuthUrl = `${apiBase}/api-b/wx_auth`;
  }

  login(name, pass): Observable<any> {
    return this.http.post<any>(this.loginUrl, {name, pass}, this.httpOptions)
      .pipe(
        map((userinfo) => {
          if (userinfo && userinfo.ok === 1) {
            this.processLogin(userinfo);
          }
          return userinfo;
        }));
  }

  logout(): Observable<OpResult> {
    return this.http.delete(this.loginUrl, this.httpOptions)
      .pipe(
        map((opr: OpResult) => {
          if (opr && opr.ok === 1) {
            let from = this.currentUser ? this.currentUser.name : null;
            this.currentUser = null;
            if (from !== null) {
              this.onCurrentUserChanged.emit({from, to: null});
            }
          }
          return opr;
        })
      );
  }

  checkLogin(): Observable<any> {
    let url = `${this.loginUrl}/userinfo`;
    return this.http.get<any>(url, this.httpOptions)
      .pipe(
        map(userinfo => {
          if (userinfo && userinfo.login) {
            this.processLogin(userinfo);
          }
          return userinfo;
        })
      );
  }


  private processLogin(userinfo) {
    let cu = this.currentUser;
    let from = cu ? cu.name : null;
    if (userinfo && userinfo.nickName) {
      cu = new User();
      Object.assign(cu, userinfo);
    } else {
      cu = null;
    }
    this.currentUser = cu;
    let to = cu ? cu.name : null;
    if (from !== to) {
      this.onCurrentUserChanged.emit({from, to});
    }
  }


  requestAccessTokenAndLogin(code: string): Observable<any> {
    let url = `${this.wxAuthUrl}/requestAccessTokenAndLogin`;
    return this.http.post<any>(url, {code}, this.httpOptions)
      .pipe(
        map((userinfo) => {
          this.processLogin(userinfo);
          return userinfo;
        }));
  }
}

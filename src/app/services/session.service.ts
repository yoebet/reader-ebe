import {Injectable, EventEmitter} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs/';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {DefaultHttpHeaders, HeaderNames} from '../config';
import {User} from '../models/user';
import {OpResult} from '../models/op-result';

@Injectable()
export class SessionService {

  // private httpOptions = {
  //   headers: new HttpHeaders(DefaultHttpHeaders),
  //   withCredentials: true
  // };

  private loginUrl: string;

  private wxAuthUrl: string;

  currentUser: User;

  readonly onCurrentUserChanged = new EventEmitter<{ from, to }>();

  constructor(private http: HttpClient) {
    let apiBase = environment.apiBase || '';
    this.loginUrl = `${apiBase}/api-b/login`;
    this.wxAuthUrl = `${apiBase}/api-b/wx_auth`;
  }

  getHttpOptions() {
    let headers = new HttpHeaders(DefaultHttpHeaders);
    let UN = HeaderNames.UserName;
    let UT = HeaderNames.UserToken;
    // let NTD = HeaderNames.NameTokenDigest;

    let cu = this.currentUser;
    if (cu && cu.name && cu.accessToken) {
      headers = headers.set(UN, cu.name);
      headers = headers.set(UT, cu.accessToken);
      // let digest = this.getMd5(`${cu.name}.${cu.accessToken}`);
      // headers = headers.set(NTD, digest);
    } else {
      let storage = window.localStorage;
      let un = storage.getItem(UN);
      let ut = storage.getItem(UT);
      if (un && ut) {
        headers = headers.set(UN, un);
        headers = headers.set(UT, ut);
        // let digest = this.getMd5(`${un}.${ut}`);
        // headers = headers.set(NTD, digest);
      }
    }
    return {
      headers/*,
      withCredentials: true*/
    };
  }


  login(name, pass): Observable<any> {
    return this.http.post<any>(this.loginUrl, {name, pass}, this.getHttpOptions())
      .pipe(
        map((userinfo) => {
          if (userinfo && userinfo.ok === 1) {
            this.processLogin(userinfo);
          }
          return userinfo;
        }));
  }

  logout(): Observable<OpResult> {
    return this.http.delete(this.loginUrl, this.getHttpOptions())
      .pipe(
        map((opr: OpResult) => {
          if (opr && opr.ok === 1) {
            let storage = window.localStorage;
            storage.removeItem(HeaderNames.UserName);
            storage.removeItem(HeaderNames.UserToken);
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
    return this.http.get<any>(url, this.getHttpOptions())
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
      if (cu.accessToken) {
        let storage = window.localStorage;
        storage.setItem(HeaderNames.UserName, cu.name);
        storage.setItem(HeaderNames.UserToken, cu.accessToken);
      }
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
    return this.http.post<any>(url, {code}, this.getHttpOptions())
      .pipe(
        map((userinfo) => {
          this.processLogin(userinfo);
          return userinfo;
        }));
  }
}

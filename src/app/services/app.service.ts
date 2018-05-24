import {Injectable, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import {User} from '../models/user';
import {OpResult} from '../models/op-result';


@Injectable()
export class AppService {

  private httpOptions = {
    withCredentials: true
  };

  private loginUrl: string;

  currentUser: User;

  onCurrentUserChanged = new EventEmitter<{ from, to }>();

  constructor(private http: HttpClient) {
    let apiBase = environment.apiBase || '';
    this.loginUrl = `${apiBase}/login`;
  }

  login(name, pass): Observable<OpResult> {
    let obs = this.http.post(this.loginUrl, {name, pass}, this.httpOptions)
      .catch(this.handleError);
    obs = obs.share();
    obs.subscribe((opr: OpResult) => {
      if (opr && opr.ok === 1) {
        let from = this.currentUser ? this.currentUser.name : null;
        this.currentUser = new User();
        this.currentUser.name = name;
        this.currentUser.role = (opr as any).role;
        if (from !== name) {
          this.onCurrentUserChanged.emit({from, to: name});
        }
      }
    });
    return obs;
  }

  logout(): Observable<OpResult> {
    let obs = this.http.delete(this.loginUrl, this.httpOptions)
      .catch(this.handleError);
    obs = obs.share();
    obs.subscribe((opr: OpResult) => {
      if (opr && opr.ok === 1) {
        let from = this.currentUser ? this.currentUser.name : null;
        this.currentUser = null;
        if (from !== null) {
          this.onCurrentUserChanged.emit({from, to: null});
        }
      }
    });
    return obs;
  }

  checkLogin(): Observable<any> {
    let url = `${this.loginUrl}/userinfo`;
    let obs = this.http.get<any>(url, this.httpOptions)
      .catch(this.handleError);
    obs = obs.share();
    obs.subscribe(userinfo => {
      let from = this.currentUser ? this.currentUser.name : null;
      if (userinfo && userinfo.login) {
        this.currentUser = new User();
        this.currentUser.name = userinfo.name;
        this.currentUser.role = userinfo.role;
      } else {
        this.currentUser = null;
      }
      let to = this.currentUser ? this.currentUser.name : null;
      if (from !== to) {
        this.onCurrentUserChanged.emit({from, to});
      }
    });
    return obs;
  }

  private handleError(error: any): Observable<any> {
    console.error(error);
    return Observable.throw(error);
  }
}

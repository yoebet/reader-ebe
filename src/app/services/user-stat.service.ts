import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {User} from '../models/user';

import {BaseService} from './base.service';
import {GroupStat} from "../models/group-stat";

@Injectable()
export class UserStatService extends BaseService<User> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/stat`;
  }

  private dailyCountByCreateDate(url: string): Observable<GroupStat[]> {

    return this.http.get<{ createDate: string, count: number }[]>(url, this.httpOptions).pipe(
      catchError(this.handleError),
      map(gcs => gcs.map(gc => new GroupStat(gc.createDate, gc.count)))
    );
  }

  dailyUsers(): Observable<GroupStat[]> {
    let url = `${this.baseUrl}/daily_users`;
    return this.dailyCountByCreateDate(url);
  }

  dailyNotes(): Observable<GroupStat[]> {
    let url = `${this.baseUrl}/daily_notes`;
    return this.dailyCountByCreateDate(url);
  }

  dailyWords(): Observable<GroupStat[]> {
    let url = `${this.baseUrl}/daily_words`;
    return this.dailyCountByCreateDate(url);
  }

  userWordsStat(): Observable<GroupStat[]> {
    let url = `${this.baseUrl}/user_words`;
    return this.http.get<{
      userId?: string,
      userName?: string,
      userNickName?: string,
      count: number
    }[]>(url, this.httpOptions).pipe(
      catchError(this.handleError),
      map(gcs =>
        gcs.map(gc => {
          let group;
          if (gc.userName) {
            group = `${gc.userName} ${gc.userNickName}`;
          } else {
            group = gc.userId;
          }
          return new GroupStat(group, gc.count);
        })
      )
    );
  }


}

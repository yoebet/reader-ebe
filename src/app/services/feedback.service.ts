import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';

import {UserFeedback} from '../models/user-feedback';
import {BaseService} from './base.service';

@Injectable()
export class FeedbackService extends BaseService<UserFeedback> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/user_feedbacks`;
  }


  list(options): Observable<UserFeedback[]> {
    let {from, limit} = options;
    let url = `${this.baseUrl}?limit=${limit}`;
    if (from) {
      url += `&from=${from}`;
    }
    return super.list(url) as Observable<UserFeedback[]>;
  }

}

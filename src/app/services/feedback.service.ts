import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/';

import {environment} from '../../environments/environment';
import {UserFeedback} from '../models/user-feedback';
import {BaseService} from './base.service';
import {SuiModalService} from 'ng2-semantic-ui';
import {SessionService} from './session.service';

@Injectable()
export class FeedbackService extends BaseService<UserFeedback> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/user_feedbacks`;
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

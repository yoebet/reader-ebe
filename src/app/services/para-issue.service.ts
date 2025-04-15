import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/';

import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';
import {ParaIssue} from '../models/para-issue';
import {OpResult} from '../models/op-result';

import {BaseService} from './base.service';
import {SessionService} from './session.service';

@Injectable()
export class ParaIssueService extends BaseService<ParaIssue> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/para_issues`;
  }


  list(options): Observable<ParaIssue[]> {
    let {from, limit} = options;
    let url = `${this.baseUrl}?limit=${limit}`;
    if (from) {
      url += `&from=${from}`;
    }
    return super.list(url) as Observable<ParaIssue[]>;
  }

  updateStatus(issueId: string, status: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${issueId}/status/${status}`;
    return this.postForOpResult(url);
  }

}

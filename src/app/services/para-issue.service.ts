import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';

import {ParaIssue} from '../models/para-issue';
import {BaseService} from './base.service';

@Injectable()
export class ParaIssueService extends BaseService<ParaIssue> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/para_issues`;
  }


  list(options): Observable<ParaIssue[]> {
    let {from, limit} = options;
    let url = `${this.baseUrl}?limit=${limit}`;
    if (from) {
      url += `&from=${from}`;
    }
    return super.list(url) as Observable<ParaIssue[]>;
  }

}

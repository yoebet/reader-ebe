import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/';

import {SuiModalService} from 'ng2-semantic-ui';

import {BaseService} from './base.service';
import {ParaComment} from '../models/para-comment';

@Injectable()
export class ParaCommentService extends BaseService<ParaComment> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/para_comments`;
  }


  list(options): Observable<ParaComment[]> {
    let {from, limit} = options;
    let url = `${this.baseUrl}?limit=${limit}`;
    if (from) {
      url += `&from=${from}`;
    }
    return super.list(url);
  }

}

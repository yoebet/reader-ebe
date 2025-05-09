import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';

import {UserBook} from '../models/user-book';
import {BaseService} from './base.service';
import {SessionService} from './session.service';

@Injectable()
export class UserBookService extends BaseService<UserBook> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/user_books`;
  }

}

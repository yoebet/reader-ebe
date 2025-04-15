import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';
import {AnnotationGroup} from '../models/annotation-group';
import {SorterService} from './sorter.service';
import {SessionService} from './session.service';

@Injectable()
export class AnnoGroupService extends SorterService<AnnotationGroup> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/anno_groups`;
  }

}

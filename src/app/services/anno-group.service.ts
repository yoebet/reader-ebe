import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';


import {BaseService} from './base.service';
import {AnnotationGroup} from "../models/annotation-group";
import {SuiModalService} from "ng2-semantic-ui";

@Injectable()
export class AnnoGroupService extends BaseService<AnnotationGroup> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/annotation_groups`;
  }


}

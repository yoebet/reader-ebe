import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {AnnotationGroup} from "../models/annotation-group";
import {SuiModalService} from "ng2-semantic-ui";
import {SorterService} from "./sorter.service";

@Injectable()
export class AnnoGroupService extends SorterService<AnnotationGroup> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/annotation_groups`;
  }

}

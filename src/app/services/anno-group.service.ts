import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';


import {BaseService} from './base.service';
import {AnnotationGroup} from "../models/annotation-group";

@Injectable()
export class AnnoGroupService extends BaseService<AnnotationGroup> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/annotation_groups`;
  }


}

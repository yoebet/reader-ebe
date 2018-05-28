import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import {BaseService} from './base.service';
import {AnnotationGroup} from "../models/annotation-group";

@Injectable()
export class AnnotationGroupService extends BaseService<AnnotationGroup> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/annotation_groups`;
  }


}

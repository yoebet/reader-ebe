import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import {BaseService} from './base.service';
import {AnnotationFamily} from "../models/annotation-family";
import {Book} from "../models/book";

@Injectable()
export class AnnotationFamilyService extends BaseService<AnnotationFamily> {

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/annotation_families`;
  }

  clone(familyId: string): Observable<AnnotationFamily> {
    let url = `${this.baseUrl}/${familyId}/clone`;
    return this.http.post<Book>(url, null, this.httpOptions)
      .catch(this.handleError);
  }


}

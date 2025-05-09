import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {of as observableOf, Observable} from 'rxjs/';
import {catchError, map} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';
import {AnnotationFamily} from '../models/annotation-family';
import {AnnotationSet} from '../anno/annotation-set';
import {BaseService} from './base.service';
import {SessionService} from './session.service';

@Injectable()
export class AnnoFamilyService extends BaseService<AnnotationFamily> {

  annotationsMap: Map<string, AnnotationSet> = new Map<string, AnnotationSet>();

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/anno_families`;
  }

  getCandidates(): Observable<AnnotationFamily[]> {
    let url = this.baseUrl + '/candidates';
    return super.list(url);
  }

  getAnnotationSet(familyId: string): Observable<AnnotationSet> {
    let anns = this.annotationsMap.get(familyId);
    if (anns) {
      return observableOf(anns);
    }

    return this.getDetail(familyId).pipe(map((family: AnnotationFamily) => {
      if (!family) {
        return null;
      }
      let groups = family.groups;
      let anns1 = new AnnotationSet(groups);
      this.annotationsMap.set(familyId, anns1);
      return anns1;
    }));
  }


  clone(familyId: string): Observable<AnnotationFamily> {
    let url = `${this.baseUrl}/${familyId}/clone`;
    return this.http.post<AnnotationFamily>(url, null, this.httpOptions).pipe(
      catchError(this.handleError));
  }

}

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import {BaseService} from './base.service';
import {AnnotationFamily} from "../models/annotation-family";
import {AnnotationGroup} from "../models/annotation-group";
import {Annotation} from "../models/annotation";
import {AnnotationSet} from "../anno/annotation-set";
import {SuiModalService} from "ng2-semantic-ui";

@Injectable()
export class AnnoFamilyService extends BaseService<AnnotationFamily> {

  annotationsMap: Map<string, AnnotationSet> = new Map<string, AnnotationSet>();

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/annotation_families`;
  }

  getCandidates(): Observable<AnnotationFamily[]> {
    let url = this.baseUrl + "/candidates";
    return super.list(url);
  }

  getAnnotationSet(familyId: string): Observable<AnnotationSet> {
    let anns = this.annotationsMap.get(familyId);
    if (anns) {
      return Observable.of(anns);
    }

    return this.getDetail(familyId).map((family: AnnotationFamily) => {
      if (!family) {
        return null;
      }
      let groups = family.groups;
      let sas = this.evalSpecialAnnotations(family);
      let anns = new AnnotationSet(groups, sas);
      this.annotationsMap.set(familyId, anns);
      return anns;
    });
  }

  private evalSpecialAnnotations(family: AnnotationFamily): Annotation[] {

    let annotations = [];
    let groupSwm = new AnnotationGroup();
    groupSwm.dataName = 'mid';
    let swm = new Annotation();
    swm.name = '选词义';
    swm.nameEn = 'SelectWordMeaning';
    swm.group = groupSwm;

    let groupAan = new AnnotationGroup();
    groupAan.dataName = 'note';
    let aan = new Annotation();
    aan.name = '加注解';
    aan.nameEn = 'AddANote';
    aan.group = groupAan;

    annotations.push(swm);
    annotations.push(aan);

    return annotations;
  }


  clone(familyId: string): Observable<AnnotationFamily> {
    let url = `${this.baseUrl}/${familyId}/clone`;
    return this.http.post<AnnotationFamily>(url, null, this.httpOptions)
      .catch(this.handleError);
  }

}

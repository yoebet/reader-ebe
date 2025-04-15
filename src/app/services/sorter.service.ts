import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/';
import {catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {Model} from '../models/model';
import {OpResult} from '../models/op-result';
import {BaseService} from './base.service';
import {SessionService} from './session.service';

export class SorterService<M extends Model> extends BaseService<M> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
  }

  protected createBeforeOrAfter(target: M | string, model: M, pos: string): Observable<M> {
    let targetId = this.modelId(target);
    const url = `${this.baseUrl}/${targetId}/create${pos}`;
    return this.http.post<M>(url, model, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  createBefore(target: M | string, model: M): Observable<M> {
    return this.createBeforeOrAfter(target, model, 'Before');
  }

  createAfter(target: M | string, model: M): Observable<M> {
    return this.createBeforeOrAfter(target, model, 'After');
  }

  protected createManyBeforeOrAfter(target: M | string,
                                    models: M[], pos: string): Observable<M[]> {
    let targetId = this.modelId(target);
    const url = `${this.baseUrl}/${targetId}/createMany${pos}`;
    return this.http.post<M>(url, models, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  createManyBefore(target: M | string, models: M[]): Observable<M[]> {
    return this.createManyBeforeOrAfter(target, models, 'Before');
  }

  createManyAfter(target: M | string, models: M[]): Observable<M[]> {
    return this.createManyBeforeOrAfter(target, models, 'After');
  }

  protected move(model: M | string, dir: string): Observable<OpResult> {
    const id = this.modelId(model);
    const url = `${this.baseUrl}/${id}/${dir}`;
    return this.postForOpResult(url);
  }

  moveUp(model: M | string): Observable<OpResult> {
    return this.move(model, 'moveUp');
  }

  moveDown(model: M | string): Observable<OpResult> {
    return this.move(model, 'moveDown');
  }

  moveTop(model: M | string): Observable<OpResult> {
    return this.move(model, 'moveTop');
  }

  moveBottom(model: M | string): Observable<OpResult> {
    return this.move(model, 'moveBottom');
  }

  swapOrder(m1: M | string, m2: M | string): Observable<OpResult> {
    const id1 = this.modelId(m1);
    const id2 = this.modelId(m2);
    const url = `${this.baseUrl}/${id1}/swapOrder/${id2}`;
    return this.http.post<M>(url, null, this.httpOptions).pipe(
      catchError(this.handleError));
  }
}


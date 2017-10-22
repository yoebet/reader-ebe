import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import {Model} from '../models/model';
import {OpResult} from '../models/op-result';
import {BaseService} from './base.service';

export class SorterService<M extends Model> extends BaseService<M> {

  constructor(protected http: HttpClient) {
    super(http);
  }

  protected createBeforeOrAfter(target: M | string, model: M, pos: string): Observable<M> {
    let targetId = this.modelId(target);
    const url = `${this.baseUrl}/${targetId}/${pos}`;
    return this.http.post<M>(url, model, this.httpOptions)
      .catch(this.handleError);
  }

  createBefore(target: M | string, model: M): Observable<M> {
    return this.createBeforeOrAfter(target, model, 'createBefore');
  }

  createAfter(target: M | string, model: M): Observable<M> {
    return this.createBeforeOrAfter(target, model, 'createAfter');
  }

  protected move(model: M | string, dir: string): Observable<OpResult> {
    const id = this.modelId(model);
    const url = `${this.baseUrl}/${id}/${dir}`;
    return this.http.post<OpResult>(url, null, this.httpOptions)
      .catch(this.handleError);
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
    return this.http.post<M>(url, null, this.httpOptions)
      .catch(this.handleError);
  }
}


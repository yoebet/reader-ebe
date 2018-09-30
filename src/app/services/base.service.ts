import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import {Model} from '../models/model';
import {OpResult} from '../models/op-result';

export class BaseService<M extends Model> {

  protected httpOptions = {
    headers: new HttpHeaders({
      // 'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  protected baseUrl: string;

  constructor(protected http: HttpClient) {
  }

  list(url: string = null): Observable<M[]> {
    return this.http.get<M[]>(url || this.baseUrl, this.httpOptions)
      .catch(this.handleError);
  }

  getOne(id: string): Observable<M> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<M[]>(url, this.httpOptions)
      .catch(this.handleError);
  }

  getOneByUrl(url: string): Observable<M> {
    return this.http.get<M[]>(url, this.httpOptions)
      .catch(this.handleError);
  }

  getDetail(id: string): Observable<M> {
    const url = `${this.baseUrl}/${id}/detail`;
    return this.getOneByUrl(url);
  }

  create(model: M): Observable<M> {
    return this.http.post<M>(this.baseUrl, model, this.httpOptions)
      .catch(this.handleError);
  }

  remove(model: M | string): Observable<OpResult> {
    const id = this.modelId(model);
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<OpResult>(url, this.httpOptions)
      .catch(this.handleError);
  }

  update(model: M): Observable<OpResult> {
    const id = this.modelId(model);
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<OpResult>(url, model, this.httpOptions)
      .catch(this.handleError);
  }

  protected modelId(model: M | string): string {
    return typeof model === 'string' ? model : model._id;
  }

  protected handleError(error: any): Observable<any> {
    // HttpErrorResponse?
    console.error(error);
    return Observable.throw(error);
  }

}


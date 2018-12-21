import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';

import {SuiModalService} from "ng2-semantic-ui";
import {ActiveModal} from "ng2-semantic-ui/dist/modules/modal/classes/active-modal";

import {Model} from '../models/model';
import {OpResult} from '../models/op-result';
import {LoginModal} from "../account/login-popup.component";

export class BaseService<M extends Model> {

  protected httpOptions = {
    headers: new HttpHeaders({
      // 'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  protected baseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
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

  protected handleError = this._handleError.bind(this);

  private static loginModal: ActiveModal<string, string, string> = null;

  protected handleError401(error: any/*, caught*/): Observable<any> {
    if (BaseService.loginModal == null) {
      BaseService.loginModal = this.modalService.open(new LoginModal('请重新登录'))
        .onDeny(d => BaseService.loginModal = null)
        .onApprove(r => BaseService.loginModal = null);
    }
    return Observable.empty();
  }

  private _handleError(error: any/*, caught*/): Observable<any> {
    /*
    error : {
      name: "HttpErrorResponse"
      ok: false
      status: 401/0
      statusText: "Unauthorized"/"Unknown Error"
      url: '...'/null
    }
    */
    if (error.status === 401) {
      return this.handleError401(error);
    }

    // console.error(error);
    return Observable.throw(error);
  }

}

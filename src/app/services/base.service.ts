import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, EMPTY, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';
import {ActiveModal} from 'ng2-semantic-ui/dist/modules/modal/classes/active-modal';

import {DefaultHttpHeaders} from '../config';
import {Model} from '../models/model';
import {OpResult} from '../models/op-result';
import {LoginModal} from '../account/login-popup.component';

export class BaseService<M extends Model> {

  protected httpOptions = {
    headers: new HttpHeaders(DefaultHttpHeaders),
    withCredentials: true
  };

  protected apiA = 'api-a';

  protected apiB = 'api-b';

  protected baseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
  }

  list(url: string = null): Observable<M[]> {
    return this.http.get<M[]>(url || this.baseUrl, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  getOne(id: string): Observable<M> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<M>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  getOneByUrl(url: string): Observable<M> {
    return this.http.get<M>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  getDetail(id: string): Observable<M> {
    const url = `${this.baseUrl}/${id}/detail`;
    return this.getOneByUrl(url);
  }

  create(model: M): Observable<M> {
    return this.http.post<M>(this.baseUrl, model, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  remove(model: M | string): Observable<OpResult> {
    const id = this.modelId(model);
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<OpResult>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  update(model: M): Observable<OpResult> {
    const id = this.modelId(model);
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<OpResult>(url, model, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  protected postForOpResult(url, body = null): Observable<OpResult> {
    return this.http.post<OpResult>(url, body, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  protected postForModel(url, body = null): Observable<M> {
    return this.http.post<M>(url, body, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  incVersion(id: string): Observable<OpResult> {
    const url = `${this.baseUrl}/${id}/incVersion`;
    return this.http.post<OpResult>(url, null, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  protected modelId(model: M | string): string {
    return typeof model === 'string' ? model : model._id;
  }

  protected handleError = (err) => this._handleError(err);

  private static loginModal: ActiveModal<string, string, string> = null;

  protected handleError400(error: any) {
    let message = this.extractErrorMessage(error);
    if (message) {
      alert(message);
    } else {
      alert('输入错误');
    }
    return EMPTY;
  }

  protected handleError401(error: any): Observable<any> {
    if (BaseService.loginModal == null) {
      BaseService.loginModal = this.modalService.open<string, string, string>(new LoginModal('请重新登录'))
        .onDeny(d => BaseService.loginModal = null)
        .onApprove(r => BaseService.loginModal = null);
    }
    return EMPTY;
  }

  protected handleError461(error: any): Observable<any> {
    let message = this.extractErrorMessage(error);
    if (message) {
      alert(message);
    } else {
      alert('没有权限');
    }
    return EMPTY;
  }

  protected handleError500(error: any): Observable<any> {
    alert('服务器内部错误');
    return EMPTY;
  }

  protected extractErrorMessage(error: any): string {
    let ee = error.error;
    if (typeof ee === 'object') {
      let message = ee.message;
      if (message && typeof message === 'string') {
        return message;
      }
      return null;
    }
    if (typeof ee !== 'string') {
      return null;
    }
    try {
      let jsonStr = ee.replace(/([\w]+):/g, '"$1":');
      let eo = JSON.parse(jsonStr);
      if (eo && typeof eo.message === 'string') {
        return eo.message;
      }
    } catch (e) {
      console.error('>> ' + ee);
    }
    return null;
  }

  private _handleError(error: any/*, caught*/): Observable<any> {
    /*
    error : {
      error: `{"ok":0,"message":"code is Required"}`
      name: "HttpErrorResponse"
      ok: false
      status: 400/401/500/0
      statusText: "Unauthorized"/"Unknown Error"
      url: '...'/null
    }
    */
    if (typeof error === 'undefined') {
      alert('没有结果');
      return EMPTY;
    }
    switch (error.status) {
      case 400:
        return this.handleError400(error);
      case 401:
        return this.handleError401(error);
      case 413:
        // {ok: 0, message: "request entity too large"}
        alert('内容过大');
        return EMPTY;
      case 461:
        return this.handleError461(error);
      case 500:
        return this.handleError500(error);
      case 0:
      default:
        // alert('发生错误了，请检查网络连接');
        console.error(error);
    }

    // console.error(error);
    return throwError(error);
  }

}

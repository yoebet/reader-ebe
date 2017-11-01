import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

import {Para} from '../models/para';
import {SorterService} from './sorter.service';

@Injectable()
export class ParaService extends SorterService<Para> {

  protected chapBaseUrl: string;

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.chapBaseUrl = `${apiBase}chaps`;
    this.baseUrl = `${apiBase}paras`;
  }

  create(para: Para): Observable<Para> {
    let chapId = para.chapId;
    const url = `${this.chapBaseUrl}/${chapId}/paras`;
    return this.http.post<Para>(url, para, this.httpOptions)
      .catch(this.handleError);
  }

  createMany(paras: Para[]): Observable<Para[]> {
    if (paras.length === 0) {
      return Observable.of([]);
    }
    let chapId = paras[0].chapId;
    const url = `${this.chapBaseUrl}/${chapId}/paras`;
    return this.http.put<Para>(url, paras, this.httpOptions)
      .catch(this.handleError);
  }

}


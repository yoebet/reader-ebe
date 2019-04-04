import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import {Chap} from '../models/chap';
import {SorterService} from './sorter.service';
import {SuiModalService} from "ng2-semantic-ui";
import {OpResult} from "../models/op-result";

@Injectable()
export class ChapService extends SorterService<Chap> {

  protected bookBaseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.bookBaseUrl = `${apiBase}/${this.apiA}/books`;
    this.baseUrl = `${apiBase}/${this.apiA}/chaps`;
  }

  create(chap: Chap): Observable<Chap> {
    let bookId = chap.bookId;
    const url = `${this.bookBaseUrl}/${bookId}/chaps`;
    return this.http.post<Chap>(url, chap, this.httpOptions)
      .catch(this.handleError);
  }

  buildContentPack(chapId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${chapId}/buildChapPack`;
    return this.postForOpResult(url);
  }

  dropContentPack(chapId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${chapId}/dropChapPack`;
    return this.postForOpResult(url);
  }
}


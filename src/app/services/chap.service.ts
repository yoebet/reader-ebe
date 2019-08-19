import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable, of} from 'rxjs';
import {map, catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {Chap} from '../models/chap';
import {ParaIdCount} from '../models/para';
import {OpResult} from '../models/op-result';

import {SorterService} from './sorter.service';


@Injectable()
export class ChapService extends SorterService<Chap> {

  protected bookBaseUrl: string;
  protected baseUrlUserEnd: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.bookBaseUrl = `${apiBase}/${this.apiA}/books`;
    this.baseUrl = `${apiBase}/${this.apiA}/chaps`;
    this.baseUrlUserEnd = `${apiBase}/${this.apiB}/chaps`;
  }

  create(chap: Chap): Observable<Chap> {
    let bookId = chap.bookId;
    const url = `${this.bookBaseUrl}/${bookId}/chaps`;
    return this.http.post<Chap>(url, chap, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateParasTrans(chapId: string, idTrans: any[]): Observable<OpResult> {
    let url = `${this.baseUrl}/${chapId}/paras_trans`;
    return this.http.post<OpResult>(url, idTrans, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  buildContentPack(chapId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${chapId}/buildChapPack`;
    return this.postForOpResult(url);
  }

  dropContentPack(chapId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${chapId}/dropChapPack`;
    return this.postForOpResult(url);
  }

  paraNotesCount(chapId: string): Observable<ParaIdCount[]> {
    let url = `${this.baseUrl}/${chapId}/paraNotesCount`;
    return this.http.get<ParaIdCount[]>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  loadCommentsCount(chap: Chap): Observable<number> {
    if (!chap || !chap.paras || chap.paras.length === 0) {
      return of(0);
    }

    let url = `${this.baseUrlUserEnd}/${chap._id}/paraCommentsCount`;
    return this.http.get<ParaIdCount[]>(url, this.httpOptions)
      .pipe(
        map((idCounts: ParaIdCount[]) => {
          let parasMap = new Map();
          for (let p of chap.paras) {
            p.commentsCount = 0;
            parasMap.set(p._id, p);
          }

          let total = 0;
          for (let {paraId, count} of idCounts) {
            total += count;
            let para = parasMap.get(paraId);
            if (para) {
              para.commentsCount = count;
            }
          }
          chap.paraCommentsCountLoaded = true;
          return total;
        }),
        catchError(this.handleError));
  }
}

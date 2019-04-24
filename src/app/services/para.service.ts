import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {of as observableOf, combineLatest as observableCombineLatest, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {Chap} from '../models/chap';
import {Para} from '../models/para';
import {SorterService} from './sorter.service';
import {ChapService} from './chap.service';
import {BookService} from './book.service';

@Injectable()
export class ParaService extends SorterService<Para> {

  protected chapBaseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              private bookService: BookService,
              private chapService: ChapService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.chapBaseUrl = `${apiBase}/${this.apiA}/chaps`;
    this.baseUrl = `${apiBase}/${this.apiA}/paras`;
  }

  loadPara(id: string): Observable<Para> {
    return Observable.create(observer => {
      this.getOne(id).subscribe((para: Para) => {
        if (!para) {
          observer.next(null);
          observer.complete();
          return;
        }
        let {bookId, chapId} = para;
        observableCombineLatest(
          this.bookService.getOne(bookId),
          this.chapService.getOne(chapId))
          .subscribe(([book, chap]) => {
            para.book = book;
            para.chap = chap as Chap;
            observer.next(para);
            observer.complete();
          });
      });
    });
  }

  create(para: Para): Observable<Para> {
    let chapId = para.chapId;
    const url = `${this.chapBaseUrl}/${chapId}/paras`;
    return this.http.post<Para>(url, para, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  createMany(paras: Para[]): Observable<Para[]> {
    if (paras.length === 0) {
      return observableOf([]);
    }
    let chapId = paras[0].chapId;
    const url = `${this.chapBaseUrl}/${chapId}/paras`;
    return this.http.put<Para>(url, paras, this.httpOptions).pipe(
      catchError(this.handleError));
  }

}


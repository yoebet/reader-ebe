import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

import {Chap} from '../models/chap';
import {Para} from '../models/para';
import {SorterService} from './sorter.service';
import {ChapService} from './chap.service';
import {BookService} from './book.service';

@Injectable()
export class ParaService extends SorterService<Para> {

  protected chapBaseUrl: string;

  constructor(protected http: HttpClient,
              private bookService: BookService,
              private chapService: ChapService) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.chapBaseUrl = `${apiBase}/chaps`;
    this.baseUrl = `${apiBase}/paras`;
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
        Observable.combineLatest(
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


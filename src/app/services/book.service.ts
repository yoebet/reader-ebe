import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/';
import {catchError} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';
import {Book, BookImage, PrivilegedUsers} from '../models/book';
import {OpResult} from '../models/op-result';
import {UserIdName} from '../models/user';
import {UserBook} from '../models/user-book';

import {SorterService} from './sorter.service';
import {SessionService} from './session.service';


@Injectable()
export class BookService extends SorterService<Book> {

  bookUsersBase: string;
  bookPacksBase: string;
  bookExpsBase: string;
  expsAdminBase: string;
  wxMpBase: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/books`;
    this.bookUsersBase = `${apiBase}/${this.apiA}/book_users`;
    this.bookPacksBase = `${apiBase}/${this.apiA}/book_packs`;
    this.bookExpsBase = `${apiBase}/${this.apiA}/book_exps`;
    this.expsAdminBase = `${apiBase}/${this.apiA}/book_exps_a`;
    this.wxMpBase = `${apiBase}/${this.apiA}/wx_mp`;
  }

  list(options: any = {}): Observable<Book[]> {
    let url = this.baseUrl;
    let hasParam = false;
    for (let name of ['cat', 'visib', 'status']) {
      let value = options[name];
      if (value) {
        url += `${hasParam ? '&' : '?'}${name}=${value}`;
        hasParam = true;
      }
    }
    return super.list(url);
  }

  listByCat(cat: string): Observable<Book[]> {
    let url = `${this.baseUrl}?cat=${cat}`;
    return super.list(url);
  }

  setALLChapsStatus(bookId: string, status: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/setALLChapsStatus/${status}`;
    return this.postForOpResult(url);
  }

  uploadImage(bookId: string, file: File): Observable<BookImage> {
    let url = `${this.baseUrl}/${bookId}/image`;
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post<BookImage>(url, formData, this.httpOptions);
  }

  /* book_users */

  getPrivilegedUsers(bookId: string): Observable<PrivilegedUsers> {
    let url = `${this.bookUsersBase}/${bookId}/privilegedUsers`;
    return this.http.get<PrivilegedUsers>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getEditors(bookId: string): Observable<UserBook[]> {
    let url = `${this.bookUsersBase}/${bookId}/editors`;
    return this.http.get<UserBook[]>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  setChiefEditor(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.bookUsersBase}/${bookId}/chiefEditor/${userId}`;
    return this.postForOpResult(url);
  }

  addEditor(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.bookUsersBase}/${bookId}/editor/${userId}`;
    return this.postForOpResult(url);
  }

  removeEditor(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.bookUsersBase}/${bookId}/editor/${userId}`;
    return this.http.delete<OpResult>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  addReader(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.bookUsersBase}/${bookId}/reader/${userId}`;
    return this.postForOpResult(url);
  }

  removeReader(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.bookUsersBase}/${bookId}/reader/${userId}`;
    return this.http.delete<OpResult>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  checkCandidate(bookId: string, name: string): Observable<UserIdName> {
    let url = `${this.bookUsersBase}/${bookId}/checkCandidate/${name}`;
    return this.http.post<UserIdName>(url, null, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /* book_packs */

  buildContentPack(bookId: string, role: string): Observable<OpResult> {
    let url = `${this.bookPacksBase}/${bookId}/buildContentPack`;
    return this.postForOpResult(url, {role});
  }

  dropContentPack(bookId: string, role: string): Observable<OpResult> {
    let url = `${this.bookPacksBase}/${bookId}/dropContentPack`;
    return this.postForOpResult(url, {role});
  }

  buildChapPacks(bookId: string, scope: string): Observable<OpResult> {
    let url = `${this.bookPacksBase}/${bookId}/buildChapPacks`;
    return this.postForOpResult(url, {scope});
  }

  dropChapPacks(bookId: string): Observable<OpResult> {
    let url = `${this.bookPacksBase}/${bookId}/dropChapPacks`;
    return this.postForOpResult(url);
  }

  /* url */

  shortUrl(longUrl: string, context = {}): Observable<any> {
    let url = `${this.wxMpBase}/shortUrl`;
    let data = Object.assign({url: longUrl}, context);
    return this.http.post<any>(url, data, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /* edit experiment admin */

  createExpBook(oriBookId: string): Observable<Book> {
    let url = `${this.expsAdminBase}/${oriBookId}/createExp`;
    return this.postForModel(url);
  }

  syncExpBook(bookId: string): Observable<OpResult> {
    let url = `${this.expsAdminBase}/${bookId}/syncExpBook`;
    return this.postForOpResult(url);
  }

  syncExpChap(bookId: string, chapId: string): Observable<OpResult> {
    let url = `${this.expsAdminBase}/${bookId}/syncExpChap/${chapId}`;
    return this.postForOpResult(url);
  }

  syncExpOriChap(bookId: string, oriChapId: string): Observable<OpResult> {
    let url = `${this.expsAdminBase}/${bookId}/syncExpOriChap/${oriChapId}`;
    return this.postForOpResult(url);
  }

  dropExpChap(bookId: string, chapId: string): Observable<OpResult> {
    let url = `${this.expsAdminBase}/${bookId}/dropExpChap/${chapId}`;
    return this.http.delete<OpResult>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

  backup(bookId: string): Observable<Book> {
    let url = `${this.expsAdminBase}/${bookId}/backup`;
    return this.http.post<Book>(url, null, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /* edit experiment */

  experimentBooks(): Observable<Book[]> {
    let url = `${this.bookExpsBase}/`;
    return super.list(url);
  }

  addExpBook(bookId: string): Observable<OpResult> {
    let url = `${this.bookExpsBase}/${bookId}/add`;
    return this.postForOpResult(url);
  }

  removeExpBook(bookId: string): Observable<OpResult> {
    let url = `${this.bookExpsBase}/${bookId}/remove`;
    return this.postForOpResult(url);

  }

}

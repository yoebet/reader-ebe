import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {SuiModalService} from "ng2-semantic-ui";
import {Observable} from "rxjs/Observable";

import {Book, BookImage, PrivilegedUsers} from '../models/book';
import {SorterService} from './sorter.service';
import {OpResult} from "../models/op-result";
import {UserIdName} from "../models/user";
import {UserBook} from "../models/user-book";

@Injectable()
export class BookService extends SorterService<Book> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/books`;
  }


  backup(bookId: string): Observable<Book> {
    let url = `${this.baseUrl}/${bookId}/backup`;
    return this.http.post<Book>(url, null, this.httpOptions)
      .catch(this.handleError);
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


  getPrivilegedUsers(bookId: string): Observable<PrivilegedUsers> {
    let url = `${this.baseUrl}/${bookId}/privilegedUsers`;
    return this.http.get<PrivilegedUsers>(url, this.httpOptions)
      .catch(this.handleError);
  }

  getEditors(bookId: string): Observable<UserBook[]> {
    let url = `${this.baseUrl}/${bookId}/editors`;
    return this.http.get<UserBook[]>(url, this.httpOptions)
      .catch(this.handleError);
  }

  setChiefEditor(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/chiefEditor/${userId}`;
    return this.postForOpResult(url);
  }

  addEditor(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/editor/${userId}`;
    return this.postForOpResult(url);
  }

  removeEditor(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/editor/${userId}`;
    return this.http.delete<OpResult>(url, this.httpOptions)
      .catch(this.handleError);
  }

  addReader(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/reader/${userId}`;
    return this.postForOpResult(url);
  }

  removeReader(bookId: string, userId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/reader/${userId}`;
    return this.http.delete<OpResult>(url, this.httpOptions)
      .catch(this.handleError);
  }

  checkCandidate(bookId: string, name: string): Observable<UserIdName> {
    let url = `${this.baseUrl}/${bookId}/checkCandidate/${name}`;
    return this.http.post<UserIdName>(url, null, this.httpOptions)
      .catch(this.handleError);
  }

  buildContentPack(bookId: string, role: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/buildContentPack`;
    return this.postForOpResult(url, {role});
  }

  dropContentPack(bookId: string, role: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/dropContentPack`;
    return this.postForOpResult(url, {role});
  }

  buildChapPacks(bookId: string, scope: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/buildChapPacks`;
    return this.postForOpResult(url, {scope});
  }

  dropChapPacks(bookId: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${bookId}/dropChapPacks`;
    return this.postForOpResult(url);
  }

  private postForOpResult(url, body = null): Observable<OpResult> {
    return this.http.post<OpResult>(url, body, this.httpOptions)
      .catch(this.handleError);
  }

}

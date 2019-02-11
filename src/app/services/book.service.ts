import {Injectable} from '@angular/core';
import {HttpClient, HttpRequest, HttpEventType, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {SuiModalService} from "ng2-semantic-ui";
import {Observable} from "rxjs/Observable";
import {Subject} from 'rxjs/Subject';

import {Book, BookImage} from '../models/book';
import {SorterService} from './sorter.service';
import {OpResult} from "../models/op-result";

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
    return this.http.post<OpResult>(url, null, this.httpOptions)
      .catch(this.handleError);
  }

  uploadImage(bookId: string, file: File): Observable<BookImage> {
    let url = `${this.baseUrl}/${bookId}/image`;
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post<BookImage>(url, formData, this.httpOptions);
  }

}

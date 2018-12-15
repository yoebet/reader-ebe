import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import {UserMessage} from '../models/user-message';
import {BaseService} from './base.service';
import {OpResult} from "../models/op-result";

@Injectable()
export class UserMessageService extends BaseService<UserMessage> {

  adminBaseUrl: string;

  constructor(protected http: HttpClient) {
    super(http);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/user_messages`;
    this.adminBaseUrl = `${apiBase}/messages`;
  }


  list(options): Observable<UserMessage[]> {
    let {from, limit} = options;
    let url = `${this.baseUrl}?limit=${limit}`;
    if (from) {
      url += `&from=${from}`;
    }
    return super.list(url) as Observable<UserMessage[]>;
  }

  markAsRead(messageId: string): Observable<OpResult> {
    let url = this.baseUrl + '/markAsRead/' + messageId;
    return this.http.post<OpResult>(url, null, this.httpOptions)
      .catch(this.handleError);
  }

  protected sessionMessages(sessionId: string): Observable<UserMessage[]> {
    let url = this.adminBaseUrl + '/sessionId/' + sessionId;
    return super.list(url) as Observable<UserMessage[]>;
  }

  replyIssue(issueId: string, message: any): Observable<UserMessage[]> {
    let url = this.adminBaseUrl + '/replyIssue/' + issueId;
    return this.http.post<OpResult>(url, message, this.httpOptions)
      .catch(this.handleError);
  }

  replyFeedback(feedbackId: string, message: any): Observable<UserMessage[]> {
    let url = this.adminBaseUrl + '/replyFeedback/' + feedbackId;
    return this.http.post<OpResult>(url, message, this.httpOptions)
      .catch(this.handleError);
  }

  getForFeedback(feedbackId: string): Observable<UserMessage[]> {
    return this.sessionMessages(feedbackId);
  }

  getForIssue(issueId: string): Observable<UserMessage[]> {
    return this.sessionMessages(issueId);
  }

}

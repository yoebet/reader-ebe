import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from 'rxjs';



import {UserMessage} from '../models/user-message';
import {BaseService} from './base.service';
import {OpResult} from '../models/op-result';
import {SuiModalService} from 'ng2-semantic-ui';

@Injectable()
export class UserMessageService extends BaseService<UserMessage> {

  adminBaseUrl: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiB}/user_messages`;
    this.adminBaseUrl = `${apiBase}/${this.apiA}/messages`;
  }


  list(options): Observable<UserMessage[]> {
    let {from, limit} = options;
    let url = `${this.baseUrl}?limit=${limit}`;
    if (from) {
      url += `&from=${from}`;
    }
    return super.list(url) as Observable<UserMessage[]>;
  }

  messagesWith(userId: string, options = null): Observable<UserMessage[]> {
    if (!options) {
      options = {limit: 8};
    }
    let {from, limit} = options;
    let url = `${this.baseUrl}/with/${userId}?limit=${limit}`;
    if (from) {
      url += `&from=${from}`;
    }
    return super.list(url) as Observable<UserMessage[]>;
  }

  sessionMessages(sessionId: string): Observable<UserMessage[]> {
    let url = this.adminBaseUrl + '/session/' + sessionId;
    return super.list(url) as Observable<UserMessage[]>;
  }

  markAsRead(messageId: string): Observable<OpResult> {
    let url = this.baseUrl + '/markAsRead/' + messageId;
    return this.postForOpResult(url);
  }

  sendMessage(message: UserMessage): Observable<OpResult> {
    let {subject, content, receiverId, sessionId, sendAsRole} = message;
    let url = this.baseUrl + '/send/';
    return this.postForOpResult(url,
      {subject, content, receiverId, sessionId, sendAsRole});
  }

  replyMessage(messageId: string, message: UserMessage): Observable<OpResult> {
    let {subject, content, sendAsRole} = message;
    let url = this.baseUrl + '/reply/' + messageId;
    return this.postForOpResult(url,
      {subject, content, sendAsRole});
  }

  replyIssue(issueId: string, message: UserMessage): Observable<OpResult> {
    let url = this.adminBaseUrl + '/replyIssue/' + issueId;
    return this.postForOpResult(url,
      {subject: message.subject, content: message.content});
  }

  replyFeedback(feedbackId: string, message: UserMessage): Observable<OpResult> {
    let url = this.adminBaseUrl + '/replyFeedback/' + feedbackId;
    return this.postForOpResult(url,
      {subject: message.subject, content: message.content});
  }

}

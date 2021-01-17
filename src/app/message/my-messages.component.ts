import {Component, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {UserMessageService} from '../services/user-message.service';
import {PageableListComponent} from '../common/pageable-list.component';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {UserMessage} from '../models/user-message';
import {MessageScope} from './message-scope';
import {UserMessagesModal} from './user-messages-popup.component';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'my-messages',
  templateUrl: './my-messages.component.html',
  styleUrls: ['./user-messages-popup.component.css']
})
export class MyMessagesComponent extends PageableListComponent implements OnInit {
  messages: UserMessage[];

  constructor(private userMessageService: UserMessageService,
              private sessionService: SessionService,
              public modalService: SuiModalService) {
    super();
  }

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  doList(options: any) {
    this.userMessageService
      .list(options)
      .subscribe(messages => this.messages = messages);
  }

  ngOnInit() {
    this.list();
  }

  markAsRed(message: UserMessage) {
    this.userMessageService.markAsRed(message._id)
      .subscribe(opr => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        message.readFlag = true;
      });
  }

  remove(message: UserMessage): void {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.userMessageService
      .remove(message._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        if (this.messages) {
          this.messages = this.messages.filter(m => m !== message);
        }
      });
  }

  showMessagesWithUser(message: UserMessage) {
    console.log(message);
    let cu = this.currentUser;
    if (!cu) {
      return;
    }
    let scope = new MessageScope();
    if (message.sessionId) {
      scope.sessionId = message.sessionId;
    }
    scope.replyForType = 'UserMessage';
    scope.replyFor = message;
    let receiver = new User();
    if (cu._id === message.receiverId) {
      receiver._id = message.senderId;
      receiver.name = message.senderName;
      receiver.nickName = message.senderNickName;
    } else if (cu._id === message.senderId) {
      receiver._id = message.receiverId;
      receiver.name = message.receiverName;
      receiver.nickName = message.receiverNickName;
    } else {
      return;
    }
    scope.receiver = receiver;
    this.modalService.open(new UserMessagesModal(scope))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

}

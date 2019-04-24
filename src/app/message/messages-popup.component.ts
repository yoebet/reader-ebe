import {Component, OnInit} from '@angular/core';
import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';

import {MessageScope} from './message-scope';
import {UserMessage} from '../models/user-message';
import {UserMessageService} from '../services/user-message.service';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {OpResult} from '../models/op-result';
import {UserFeedback} from '../models/user-feedback';
import {ParaIssue} from '../models/para-issue';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

@Component({
  selector: 'messages-popup',
  templateUrl: './messages-popup.component.html',
  styleUrls: ['./messages-popup.component.css']
})
export class MessagesPopupComponent implements OnInit {
  scope: MessageScope;
  messages: UserMessage[];

  newMessage: UserMessage;

  constructor(private userMessageService: UserMessageService,
              private sessionService: SessionService,
              private modal: SuiModal<MessageScope, string, string>) {
    this.scope = modal.context;
  }

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  ngOnInit() {
    let scope = this.scope;
    let service = this.userMessageService;

    let setMessages = (messages) => {
      if (messages && messages.length > 0) {
        this.messages = messages;
      } else {
        this.editNew();
      }
    };
    if (scope.sessionId) {
      service.sessionMessages(scope.sessionId).subscribe(setMessages);
    } else if (scope.receiver) {
      service.messagesWith(scope.receiver._id).subscribe(setMessages);
    } else {
      this.editNew();
    }
  }

  markRed(message: UserMessage) {
    this.userMessageService.markAsRead(message._id)
      .subscribe(opr => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        message.readFlag = true;
      });
  }

  editNew() {
    let message = new UserMessage();
    let scope = this.scope;
    if (!scope.receiver) {
      return;
    }
    message.receiverId = scope.receiver._id;
    if (scope.sessionId) {
      message.sessionId = scope.sessionId;
    }
    if (scope.sendAsRole) {
      message.sendAsRole = scope.sendAsRole;
    }
    this.newMessage = message;
  }

  cancel() {
    this.newMessage = null;
  }

  send() {
    let message = this.newMessage;
    if (!message || message.content.trim() === '') {
      return;
    }

    let replyForType = this.scope.replyForType;
    let replyFor = this.scope.replyFor;
    let service = this.userMessageService;
    let obs = null;

    if (replyForType === 'UserMessage') {
      obs = service.replyMessage(replyFor._id, message);
    } else if (replyForType === 'UserFeedback') {
      obs = service.replyFeedback(replyFor._id, message);
    } else if (replyForType === 'ParaIssue') {
      obs = service.replyIssue(replyFor._id, message);
    } else {
      obs = service.sendMessage(message);
    }

    obs.subscribe((opr: OpResult) => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail');
        return;
      }
      if (!this.messages) {
        this.messages = [];
      }
      let cu = this.currentUser;
      let receiver = this.scope.receiver;
      message._id = opr.id;
      message.senderId = cu._id;
      message.senderName = cu.name;
      message.senderNickName = cu.nickName;
      message.receiverName = receiver.name;
      message.receiverNickName = receiver.nickName;
      this.messages.push(message);
      this.newMessage = null;

      if (replyForType === 'UserFeedback' || replyForType === 'ParaIssue') {
        replyFor.replied = true;
      }
    });
  }

  close() {
    this.modal.approve('');
  }

}

export class MessagesModal extends ComponentModalConfig<MessageScope> {
  constructor(scope: MessageScope) {
    super(MessagesPopupComponent, scope, false);
    this.size = ModalSize.Normal;
    // this.isFullScreen = true;
    this.mustScroll = true;
  }
}

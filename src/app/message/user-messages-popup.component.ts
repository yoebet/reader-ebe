import {Component, OnInit} from '@angular/core';
import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';

import {MessageScope} from './message-scope';
import {UserMessage} from '../models/user-message';
import {UserMessageService} from '../services/user-message.service';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {OpResult} from '../models/op-result';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';
import {Book} from '../models/book';

@Component({
  selector: 'user-messages-popup',
  templateUrl: './user-messages-popup.component.html',
  styleUrls: ['./user-messages-popup.component.css']
})
export class UserMessagesPopupComponent implements OnInit {
  scope: MessageScope;
  messages: UserMessage[];

  newMessage: UserMessage;

  setMessages = messages => {
    if (messages && messages.length > 0) {
      this.messages = messages.reverse();
    } else {
      this.editNew();
    }
  }

  constructor(protected userMessageService: UserMessageService,
              protected sessionService: SessionService,
              protected modal: SuiModal<MessageScope, string, string>) {
    this.scope = modal.context;
  }

  get currentUser(): User {
    return this.sessionService.currentUser;
  }


  ngOnInit() {
    let scope = this.scope;
    this.userMessageService.messagesWith(scope.receiver._id)
      .subscribe(this.setMessages);
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
    let replyFor = scope.replyFor;
    if (replyFor) {
      message.replyTargetId = replyFor._id;
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

    this.userMessageService.sendMessage(message)
      .subscribe((opr: OpResult) => {
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
      });
  }

  close() {
    this.modal.approve('');
  }

}

export class UserMessagesModal extends ComponentModalConfig<MessageScope> {
  constructor(scope: MessageScope) {
    super(UserMessagesPopupComponent, scope, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = true;
  }
}

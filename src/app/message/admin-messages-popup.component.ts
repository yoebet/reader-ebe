import {Component} from '@angular/core';
import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';

import {MessageScope} from './message-scope';
import {UserMessageService} from '../services/user-message.service';
import {SessionService} from '../services/session.service';
import {OpResult} from '../models/op-result';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';
import {UserMessagesPopupComponent} from './user-messages-popup.component';

@Component({
  selector: 'messages-popup',
  templateUrl: '../message/user-messages-popup.component.html',
  styleUrls: ['../message/user-messages-popup.component.css']
})
export class AdminMessagesPopupComponent extends UserMessagesPopupComponent {

  constructor(protected userMessageService: UserMessageService,
              protected sessionService: SessionService,
              protected modal: SuiModal<MessageScope, string, string>) {
    super(userMessageService, sessionService, modal);
  }


  ngOnInit() {
    let scope = this.scope;
    let service = this.userMessageService;

    if (scope.sessionId) {
      service.sessionMessages(scope.sessionId).subscribe(this.setMessages);
    } else if (scope.receiver) {
      service.messagesWith(scope.receiver._id).subscribe(this.setMessages);
    } else {
      this.editNew();
    }
  }


  send() {
    let message = this.newMessage;
    if (!message || message.content.trim() === '') {
      return;
    }

    let replyForType = this.scope.replyForType;
    let replyFor = this.scope.replyFor;
    let service = this.userMessageService;
    let obs;

    if (replyForType === 'UserFeedback') {
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

}

export class AdminMessagesModal extends ComponentModalConfig<MessageScope> {
  constructor(scope: MessageScope) {
    super(AdminMessagesPopupComponent, scope, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = true;
  }
}

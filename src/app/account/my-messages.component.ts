import {Component, OnInit} from '@angular/core';

import {UserMessage} from '../models/user-message';
import {UserMessageService} from '../services/user-message.service';
import {PageableListComponent} from '../common/pageable-list.component';
import {SessionService} from "../services/session.service";
import {User} from "../models/user";

@Component({
  selector: 'my-messages',
  templateUrl: './my-messages.component.html',
  styleUrls: ['./my-messages.component.css']
})
export class MyMessagesComponent extends PageableListComponent implements OnInit {
  messages: UserMessage[];

  constructor(private userMessageService: UserMessageService,
              private sessionService: SessionService) {
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

}

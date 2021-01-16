import {Component, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {UserFeedback} from '../models/user-feedback';
import {FeedbackService} from '../services/feedback.service';
import {PageableListComponent} from '../common/pageable-list.component';
import {AdminMessagesModal} from '../message/admin-messages-popup.component';
import {MessageScope} from '../message/message-scope';
import {User} from '../models/user';

@Component({
  selector: 'feedback-list',
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css']
})
export class FeedbackListComponent extends PageableListComponent implements OnInit {
  feedbacks: UserFeedback[];

  constructor(private feedbackService: FeedbackService,
              public modalService: SuiModalService) {
    super();
  }

  doList(options: any) {
    this.feedbackService
      .list(options)
      .subscribe(feedbacks => this.feedbacks = feedbacks);
  }

  ngOnInit() {
    this.list();
  }

  messagesForFeedback(feedback: UserFeedback) {
    let scope = new MessageScope();
    scope.sessionId = feedback._id;
    scope.replyForType = 'UserFeedback';
    scope.replyFor = feedback;
    let receiver = new User();
    receiver._id = feedback.userId;
    receiver.name = feedback.userName;
    receiver.nickName = feedback.userNickName;
    scope.receiver = receiver;
    this.modalService.open(new AdminMessagesModal(scope))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

}

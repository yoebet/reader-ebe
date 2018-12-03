import {Component, OnInit} from '@angular/core';

import {UserFeedback} from '../models/user-feedback';
import {FeedbackService} from '../services/feedback.service';
import {UserMessageService} from '../services/user-message.service';
import {PageableListComponent} from '../common/pageable-list.component';

@Component({
  selector: 'feedback-list',
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css']
})
export class FeedbackListComponent extends PageableListComponent implements OnInit {
  feedbacks: UserFeedback[];

  constructor(private feedbackService: FeedbackService,
              private userMessageService: UserMessageService) {
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

  reply(feedback:UserFeedback){
    // this.userMessageService.
  }

}

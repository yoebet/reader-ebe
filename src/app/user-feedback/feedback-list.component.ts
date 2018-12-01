import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Feedback} from '../models/feedback';
import {FeedbackService} from '../services/feedback.service';

@Component({
  selector: 'feedback-list',
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css']
})
export class FeedbackListComponent implements OnInit {
  feedbacks: Feedback[];
  page = 1;
  pageSize = 10;

  constructor(private feedbackService: FeedbackService,
              private router: Router) {
  }

  getFeedbacks() {
    let options: any = {limit: this.pageSize};
    if (this.page > 1) {
      options.from = (this.page - 1) * this.pageSize + 1;
    }
    this.feedbackService
      .list(options)
      .subscribe(feedbacks => this.feedbacks = feedbacks);
  }

  ngOnInit() {
    this.getFeedbacks();
  }

  nextPage() {
    this.page++;
    this.getFeedbacks();
  }

  previousPage() {
    if (this.page == 1) {
      return;
    }
    this.page--;
    this.getFeedbacks();
  }

}

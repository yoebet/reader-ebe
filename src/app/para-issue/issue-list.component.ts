import {Component, OnInit} from '@angular/core';

import {ParaIssue, IssueStatuses, IssueStatusNames} from '../models/para-issue';
import {ParaIssueService} from '../services/para-issue.service';
import {PageableListComponent} from '../common/pageable-list.component';
import {User} from "../models/user";
import {MessagesModal} from "../message/messages-popup.component";
import {MessageScope} from "../message/message-scope";
import {SuiModalService} from "ng2-semantic-ui";

@Component({
  selector: 'issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.css']
})
export class IssueListComponent extends PageableListComponent implements OnInit {
  issues: ParaIssue[];

  IssueStatuses = IssueStatuses;
  IssueStatusNames = IssueStatusNames;

  constructor(private paraIssueService: ParaIssueService,
              public modalService: SuiModalService) {
    super();
  }

  doList(options: any) {
    this.paraIssueService
      .list(options)
      .subscribe(issues => this.issues = issues);
  }

  ngOnInit() {
    this.list();
  }

  updateStatus(issue: ParaIssue, status: string) {
    this.paraIssueService.updateStatus(issue._id, status)
      .subscribe(opr => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        issue.status = status;
      });
  }

  messagesForIssue(issue: ParaIssue) {
    let scope = new MessageScope();
    scope.sessionId = issue._id;
    scope.replyForType = 'ParaIssue';
    scope.replyFor = issue;
    let receiver = new User();
    receiver._id = issue.userId;
    receiver.name = issue.userName;
    receiver.nickName = issue.userNickName;
    scope.receiver = receiver;
    this.modalService.open(new MessagesModal(scope))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

}

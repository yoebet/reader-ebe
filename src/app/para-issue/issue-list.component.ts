import {Component, OnInit} from '@angular/core';

import {ParaIssue, IssueStatusNames} from '../models/para-issue';
import {ParaIssueService} from '../services/para-issue.service';
import {UserMessageService} from '../services/user-message.service';
import {PageableListComponent} from '../common/pageable-list.component';

@Component({
  selector: 'issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.css']
})
export class IssueListComponent extends PageableListComponent implements OnInit {
  issues: ParaIssue[];

  IssueStatusNames = IssueStatusNames;

  constructor(private paraIssueService: ParaIssueService,
              private userMessageService: UserMessageService) {
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

  reply(issue: ParaIssue) {

  }

}

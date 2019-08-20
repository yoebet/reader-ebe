import {Component, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {ParaComment} from '../models/para-comment';
import {ParaCommentService} from "../services/para-comment.service";
import {PageableListComponent} from '../common/pageable-list.component';


@Component({
  selector: 'comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent extends PageableListComponent implements OnInit {
  comments: ParaComment[];

  constructor(private commentService: ParaCommentService,
              public modalService: SuiModalService) {
    super();
  }

  doList(options: any) {
    this.commentService
      .list(options)
      .subscribe(comments => this.comments = comments);
  }

  ngOnInit() {
    this.list();
  }


}

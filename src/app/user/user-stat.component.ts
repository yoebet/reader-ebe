import {Component, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {User} from '../models/user';
import {SessionService} from "../services/session.service";
import {UserStatService} from "../services/user-stat.service";
import {GroupStat} from "../models/group-stat";

@Component({
  selector: 'user-stat',
  templateUrl: './user-stat.component.html'
})
export class UserStatComponent implements OnInit {
  groups: GroupStat[];
  type: 'User' | 'Word' | 'Note' | 'UserWord';


  constructor(protected userStatService: UserStatService,
              protected sessionService: SessionService,
              public modalService: SuiModalService) {
  }

  ngOnInit() {
    this.stat('User');
  }

  stat(type) {
    switch (type) {
      case 'User':
        this.userStatService.dailyUsers().subscribe(gcs => {
          this.groups = gcs;
          this.type = type;
        });
        break;
      case 'Word':
        this.userStatService.dailyWords().subscribe(gcs => {
          this.groups = gcs;
          this.type = type;
        });
        break;
      case 'Note':
        this.userStatService.dailyNotes().subscribe(gcs => {
          this.groups = gcs;
          this.type = type;
        });
        break;
      case 'UserWord':
        this.userStatService.userWordsStat().subscribe(gcs => {
          this.groups = gcs;
          this.type = type;
        });
        break;
    }
  }

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

}

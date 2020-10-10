import {Component, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {StaticResource} from '../config';
import {User} from '../models/user';
import {UserService} from '../services/user.service';
import {PageableListComponent} from '../common/pageable-list.component';
import {UserInfoModal} from './user-info.component';
import {SessionService} from '../services/session.service';

@Component({
  selector: 'user-list',
  templateUrl: './users.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UsersComponent extends PageableListComponent implements OnInit {
  users: User[];
  manager: false;
  searchName: string;

  sortCT: '1' | '-1' = '-1'; //create time

  avatarsBase = StaticResource.UserAvatarsBase;

  constructor(protected userService: UserService,
              protected sessionService: SessionService,
              public modalService: SuiModalService) {
    super();
  }

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  doList(options: any) {
    if (this.manager) {
      options.manager = true;
    }
    if (this.searchName) {
      options.name = this.searchName;
    }
    if (this.sortCT) {
      options.sortCT = this.sortCT;
    }
    this.userService
      .list(options)
      .subscribe(users => this.users = users);
  }

  ngOnInit() {
    this.list();
  }

  sortByCreateTime() {
    if (!this.sortCT) {
      this.sortCT = '1';
    } else if (this.sortCT === '1') {
      this.sortCT = '-1';
    } else {
      this.sortCT = '1';
    }
    this.page = 1;
    this.doList({});
  }

  search() {
    this.page = 1;
    this.list();
  }

  searchReset() {
    this.page = 1;
    this.searchName = null;
    this.manager = false;
    this.list();
  }

  showDetail(user: User) {
    this.modalService.open(new UserInfoModal(user));
    if (!user.resourceCounts) {
      this.userService.getDetail(user._id)
        .subscribe(u => {
          if (u) {
            user.resourceCounts = u.resourceCounts;
            user.preference = u.preference;
          }
        });
    }
  }


  userTracker(index, user) {
    return user._id;
  }
}

import {Component, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {StaticResource} from '../config';
import {User} from '../models/user';
import {UserService} from '../services/user.service';
import {PageableListComponent} from '../common/pageable-list.component';
import {MessagesModal} from '../message/messages-popup.component';
import {MessageScope} from '../message/message-scope';
import {UserInfoModal} from "./user-info.component";
import {SessionService} from "../services/session.service";
import {OpResult} from "../models/op-result";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent extends PageableListComponent implements OnInit {
  users: User[];
  newUser: User;
  editingUser: User;
  manager: false;
  searchName: string;
  tokenOp = false;
  moreOp = false;

  roleOptions = User.Roles;
  avatarsBase = StaticResource.UserAvatarsBase;

  constructor(private userService: UserService,
              private sessionService: SessionService,
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
    this.userService
      .list(options)
      .subscribe(users => this.users = users);
  }

  ngOnInit() {
    this.list();
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
          }
        });
    }
  }

  edit(user) {
    this.editingUser = {
      _id: user._id,
      role: user.role,
      phoneNumber: user.phoneNumber,
      memo: user.memo
    } as User;
  }

  editing(user) {
    return this.editingUser && this.editingUser._id === user._id;
  }

  save() {
    this.userService.update(this.editingUser).subscribe(opr => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail');
        return;
      }
      let user = this.users.find(u => u._id === this.editingUser._id);
      Object.assign(user, this.editingUser);
      this.editingUser = null;
    });
  }

  editNew() {
    this.newUser = new User();
  }

  add() {
    let user = this.newUser;
    user.name = user.name.trim();
    user.nickName = user.nickName.trim();
    user.pass = user.pass.trim();
    if (!user.name || !user.nickName || !user.pass) {
      return;
    }

    // TODO: validate

    this.userService.create(user)
      .subscribe(u => {
        if (!u) {
          return;
        }
        if (u['ok'] === 0) {
          alert(u['message']);
          return;
        }
        this.users.push(u);
        this.newUser = null;
      });
  }

  messages(user: User) {
    let scope = new MessageScope();
    scope.receiver = user;
    this.modalService
      .open(new MessagesModal(scope))
      // .onDeny((d) => {})
      .onApprove((r) => {
      });
  }

  getTempToken(user: User) {
    this.userService.getTempToken(user._id)
      .subscribe(tokenObj => {
        user.tokenObj = tokenObj || {};
      });
  }

  genTempToken(user: User) {
    this.userService.genTempToken(user._id)
      .subscribe(tokenObj => {
        if (tokenObj) {
          user.tokenObj = tokenObj;
        }
      });
  }

  refreshTempToken(user: User) {
    this.userService.refreshTempToken(user._id)
      .subscribe(tokenObj => {
        if (!tokenObj) {
          alert('Token不存在');
          return;
        }
        user.tokenObj = tokenObj;
      });
  }

  dropTempToken(user: User) {
    if (!confirm('要删除Token吗？')) {
      return;
    }
    this.userService.dropTempToken(user._id)
      .subscribe(opr => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        user.tokenObj = {};
      });
  }


  dropUser(user: User) {
    if (!confirm('要删除用户吗？如果用户包含相关数据则不能删除')) {
      return;
    }
    this.userService
      .remove(user._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.users = this.users.filter(u => u !== user);
      });
  }

  userTracker(index, user) {
    return user._id;
  }
}

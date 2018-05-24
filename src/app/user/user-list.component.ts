import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import {User} from '../models/user';
import {UserService} from '../services/user.service';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[];
  newUser: User;
  editingUser: User;
  manager: false;
  searchName: string;
  page = 1;
  pageSize = 10;
  roleOptions = User.Roles;

  constructor(private userService: UserService,
              private router: Router) {
  }

  getUsers() {
    let options: any = {limit: this.pageSize};
    if (this.manager) {
      options.manager = true;
    }
    if (this.page > 1) {
      options.from = (this.page - 1) * this.pageSize + 1;
    }
    if (this.searchName) {
      options.name = this.searchName;
    }
    this.userService
      .list(options)
      .subscribe(users => this.users = users);
  }

  ngOnInit() {
    this.getUsers();
  }

  nextPage() {
    this.page++;
    this.getUsers();
  }

  previousPage() {
    if (this.page == 1) {
      return;
    }
    this.page--;
    this.getUsers();
  }

  search() {
    this.page = 1;
    this.getUsers();
  }

  searchReset() {
    this.page = 1;
    this.searchName = null;
    this.manager = false;
    this.getUsers();
  }

  edit(user) {
    this.editingUser = Object.assign({}, user);
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
    if (!user.name) {
      return;
    }
    user.pass = user.pass.trim();
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

  gotoDetail(user: User): void {
    this.router.navigate(['/users', user._id]);
  }

  userTracker(index, user) {
    return user._id;
  }
}

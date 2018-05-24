import {Component, OnInit} from '@angular/core';

import {AppService} from './services/app.service';
import {User} from './models/user';
import {OpResult} from './models/op-result';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  loginForm = false;
  loginMessage: string;

  get currentUser(): User {
    return this.appService.currentUser;
  }

  constructor(private appService: AppService) {
    // appService.onCurrentUserChanged.subscribe(change => {
    //   console.log('User Changed: ' + change.from + ' -> ' + change.to);
    // });
  }

  ngOnInit() {
    this.appService.checkLogin();
  }

  gotoLogin() {
    this.loginMessage = null;
    this.loginForm = true;
  }

  cancelLogin() {
    this.loginMessage = null;
    this.loginForm = false;
  }

  login(name, pass) {
    this.appService.login(name, pass).subscribe((opr: OpResult) => {
      if (opr && opr.ok === 1) {
        this.loginMessage = null;
        this.loginForm = false;
      } else {
        this.loginMessage = '用户名/密码错误';
      }
    });
  }

  logout() {
    this.appService.logout();
  }
}

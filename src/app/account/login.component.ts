import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';

import {SessionService} from '../services/session.service';
import {OpResult} from '../models/op-result';
import {LoginBaseComponent} from './login-base-component';

@Component({
  selector: 'login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends LoginBaseComponent implements OnInit {

  loginMessage: string;


  constructor(protected sessionService: SessionService,
              protected router: Router,
              protected location: Location) {
    super();
  }

  cancel() {
    this.loginMessage = null;
    this.location.back();
  }

  login(name, pass) {
    this.sessionService.login(name, pass)
      .subscribe((opr: OpResult) => {
        if (opr && opr.ok === 1) {
          this.loginMessage = null;
          this.router.navigate(['/']);
        } else {
          this.loginMessage = '用户名/密码错误';
        }
      }, (err) => {
        this.loginMessage = '发生错误了';
      });
  }

}

import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';

import {SelfBase} from '../config';
import {SessionService} from '../services/session.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginMethod: 'wx' | 'pass' = 'wx';

  loginMessage: string;

  constructor(private sessionService: SessionService,
              private router: Router,
              private location: Location) {
  }

  ngOnInit() {
    let obj = new window['WxLogin']({
      self_redirect: false,
      id: "login_container",
      appid: "wx0645bedc5ee3d3de",
      scope: "snsapi_login",
      redirect_uri: `${SelfBase}`,
      state: "wxeeLTAI55Dra7SzFLUi",
      // href: "https://yuwen-reading.net/ee/assets/wx-login.css",
      style: ""
    });
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

  onPassKeyup(name, pass, $event) {
    $event.stopPropagation();
    if ($event.keyCode === 13 && name && pass) {
      this.login(name, pass);
    }
  }

}

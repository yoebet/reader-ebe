import {Component, OnInit, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {DOCUMENT} from '@angular/common';

import {SuiModalService} from 'ng2-semantic-ui';

import {StaticResource} from './config';
import {User} from './models/user';
import {OpResult} from './models/op-result';
import {AppService} from './services/app.service';
import {SessionService} from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  avatarsBase = StaticResource.UserAvatarsBase;

  loginChecked = false;

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  constructor(private appService: AppService,
              private sessionService: SessionService,
              private router: Router,
              private route: ActivatedRoute,
              public modalService: SuiModalService,
              @Inject(DOCUMENT) private document) {
  }

  ngOnInit() {
    this.route.queryParamMap
      .subscribe(queryParams => {
        // console.log(queryParams);

        // let state = queryParams.get('state');
        let code = queryParams.get('code');
        if (code && code.length >= 24) {
          window.history.pushState({}, '', '/');
          this.sessionService.requestAccessTokenAndLogin(code)
            .subscribe(result => {
              console.log(result);
              if (result.ok === 0) {
                this.checkLogin();
                alert(result.message || '微信登录失败');
                return;
              }
            });
          return;
        }

        if (!this.loginChecked) {
          this.checkLogin();
          this.loginChecked = true;
        }
      });
  }

  private checkLogin() {
    this.sessionService.checkLogin()
      .subscribe();
  }

  logout() {
    this.sessionService.logout()
      .subscribe((opr: OpResult) => {
        if (opr && opr.ok === 1) {
          this.router.navigate(['/']);
        }
      });
  }
}

import {Component} from '@angular/core';

import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';
import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';

import {SessionService} from '../services/session.service';
import {OpResult} from '../models/op-result';
import {LoginBaseComponent} from "./login-base-component";


@Component({
  selector: 'login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.css']
})
export class LoginPopupComponent extends LoginBaseComponent {

  loginMessage: string;

  wxLoginUrl;

  wxAuthWindow = false;


  constructor(protected sessionService: SessionService,
              private modal: SuiModal<string, string, string>) {
    super();
    this.loginMessage = modal.context;

    this.wxLoginUrl = this.genWxAuthLink();
  }

  protected genWxQrCode() {
    this.wxQrCodeInit = true;
    setTimeout(() => {
      this.doGenWxQrCode("login_popup_container");
    }, 10);
  }

  cancel() {
    this.loginMessage = null;
    this.modal.deny('');
    if (this.wxAuthWindow) {
      this.wxAuthWindow = false;
      this.sessionService.checkLogin()
        .subscribe(a => {
        });
    }
  }

  login(name, pass) {
    this.sessionService.login(name, pass)
      .subscribe((opr: OpResult) => {
        if (opr && opr.ok === 1) {
          this.loginMessage = null;
          this.modal.approve('');
        } else {
          this.loginMessage = '用户名/密码错误';
        }
      }, (err) => {
        this.loginMessage = '发生错误了';
      });
  }

}

export class LoginModal extends ComponentModalConfig<string> {
  constructor(message: string) {
    super(LoginPopupComponent, message, false);
    this.size = ModalSize.Mini;
    this.mustScroll = true;
  }
}

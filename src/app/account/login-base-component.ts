import {OnInit} from "@angular/core";
import {SelfBase, WX_CONFIG} from "../config";


export abstract class LoginBaseComponent implements OnInit {

  loginMethod: 'wx' | 'pass' = 'pass';

  wxQrCodeInit = false;

  wxState = "wxrcee";
  wxScope = 'snsapi_login';

  ngOnInit() {
    if (this.loginMethod === 'wx') {
      this.genWxQrCode();
    }
  }

  protected genWxAuthLink(): string {
    let wxRedirectUri = encodeURIComponent(SelfBase);
    return "https://open.weixin.qq.com/connect/qrconnect" +
      "?appid=" + WX_CONFIG.appId + "&redirect_uri=" + wxRedirectUri +
      "&response_type=code&scope=" + this.wxScope + "&state=" + this.wxState + "#wechat_redirect";
  }

  protected doGenWxQrCode(containerId) {
    let redirectUri = encodeURIComponent(SelfBase);
    let obj = new window['WxLogin']({
      self_redirect: false,
      id: containerId,
      appid: WX_CONFIG.appId,
      scope: this.wxScope,
      redirect_uri: redirectUri,
      state: this.wxState,
      style: ""
    });
  }

  protected genWxQrCode() {
    this.wxQrCodeInit = true;
    this.doGenWxQrCode("login_container");
  }

  switchToWx() {
    this.loginMethod = "wx";
    if (!this.wxQrCodeInit) {
      this.genWxQrCode();
    }
  }

  abstract cancel();

  abstract login(name, pass);

  onPassKeyup(name, pass, $event) {
    $event.stopPropagation();
    if ($event.keyCode === 13 && name && pass) {
      this.login(name, pass);
    }
  }

}

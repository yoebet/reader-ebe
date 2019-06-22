import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

import {WebAppBase, WX_CONFIG} from '../config';
import {BookService} from '../services/book.service';


@Component({
  selector: 'app-link',
  templateUrl: './app-link.component.html',
  styleUrls: ['./app-link.component.css']
})
export class AppLinkComponent implements OnInit {
  @Input() appLink: AppLink;

  title: string;
  context: any;
  url: string;
  shortUrl: string;

  requestUserinfo: boolean;
  wxState: string;
  wxUrl: string;
  wxShortUrl: string;

  shortUrlMap: Map<string, string> = new Map<string, string>();

  constructor(private bookService: BookService,
              private modal: SuiModal<AppLink, string, string>) {
    this.appLink = modal.context;

    this.title = this.appLink.title;
    this.context = this.appLink.context;
    let link = this.appLink;

    this.url = `${WebAppBase}/${link.path}`;

    this.requestUserinfo = link.wxScope === 'snsapi_userinfo';
    this.wxState = link.wxState || '12';
    this.resetWxUrl();
  }

  resetWxUrl() {
    let encodedUrl = encodeURIComponent(this.url);
    let scope = this.requestUserinfo ? 'snsapi_userinfo' : 'snsapi_base';
    this.wxUrl = `https://open.weixin.qq.com/connect/oauth2/authorize`
      + `?appid=${WX_CONFIG.mp_appId}&redirect_uri=${encodedUrl}`
      + `&response_type=code&scope=${scope}&state=${this.wxState}#wechat_redirect`;
    this.wxShortUrl = this.shortUrlMap[this.wxUrl];
  }

  ngOnInit(): void {
  }

  close() {
    this.modal.approve('');
  }

  genShortUrl(url, shotUrlName) {
    this.bookService.shortUrl(url, this.context)
      .subscribe(result => {
        if (result.ok !== 1) {
          alert(result.message || 'Fail');
          return;
        }
        this[shotUrlName] = result.shortUrl;
        this.shortUrlMap[url] = result.shortUrl;
      });
  }

}

export class AppLink {
  title: string;
  path: string;
  context?: any;
  wxScope: 'snsapi_userinfo' | 'snsapi_base';
  wxState: string;
}


export class AppLinkModal extends ComponentModalConfig<AppLink> {
  constructor(appLink: AppLink) {
    super(AppLinkComponent, appLink, false);
    this.size = ModalSize.Small;
    this.mustScroll = false;
    // this.isBasic = true;
  }
}

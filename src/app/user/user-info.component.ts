import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

import {User} from '../models/user';
import {UserService} from '../services/user.service';

@Component({
  selector: 'user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent {
  @Input() user: User;

  get counters(): any {
    if (!this.user) {
      return null;
    }
    return this.user.resourceCounts;
  }

  constructor(private userService: UserService,
              private modal: SuiModal<User, string, string>) {
    this.user = modal.context;
  }

  close() {
    this.modal.approve('');
  }

}


export class UserInfoModal extends ComponentModalConfig<User> {
  constructor(user: User) {
    super(UserInfoComponent, user, true);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = false;
    // this.isBasic = true;
  }
}

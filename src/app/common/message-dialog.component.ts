import {Component} from '@angular/core';
import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';


export interface MessageContext {
  title?: string;
  msg: string;
  type?: 'error' | 'info' | '';
}


@Component({
  selector: 'message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.css']
})
export class MessageDialogComponent {

  title: string;
  msg: string;
  type: MessageContext['type'];

  constructor(
    private modal: SuiModal<MessageContext, string, string>) {
    const context = modal.context;
    this.title = context.title || '';
    this.type = context.type || 'info';
    this.msg = context.msg;
    if (!this.msg && this.type === 'error') {
      this.msg = '出错了';
    }
  }

  close(): void {
    this.modal.deny('');
  }

}

export class MessageDialogModal extends ComponentModalConfig<MessageContext> {
  constructor(context: MessageContext) {
    super(MessageDialogComponent, context, true);
    this.size = ModalSize.Mini;
    this.mustScroll = true;
  }
}

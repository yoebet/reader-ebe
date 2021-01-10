import {Component, OnInit} from '@angular/core';

import {ComponentModalConfig, ModalSize, SuiModal} from 'ng2-semantic-ui';

@Component({
  selector: 'chap-text-edit',
  templateUrl: './chap-text-edit.component.html',
  styleUrls: ['./chap-text-edit.component.css']
})
export class ChapTextEditComponent implements OnInit {

  chapText: string;
  chapTitle: string;
  allowEdit: boolean;

  editing = false;
  mayEdited = false;

  constructor(private modal: SuiModal<ChapTextEditContext, string, string>) {
    let context = modal.context;
    this.chapText = context.chapText;
    this.chapTitle = context.chapTitle;
    this.allowEdit = context.allowEdit;
    if (context.directEdit) {
      this.edit();
    }
  }

  ngOnInit(): void {
  }

  edit() {
    this.editing = true;
    this.mayEdited = true;
  }

  completeEdit() {
    this.editing = false;
  }

  cancelAndClose() {
    this.mayEdited = false;
    this.close();
  }

  close() {
    if (this.mayEdited) {
      this.modal.approve(this.chapText);
    } else {
      this.modal.approve(null);
    }
  }
}

export class ChapTextEditContext {
  chapText: string;
  chapTitle?: string;
  allowEdit = true;
  directEdit = false;
}

export class ChapTextEditModal extends ComponentModalConfig<ChapTextEditContext> {
  constructor(context: ChapTextEditContext) {
    super(ChapTextEditComponent, context, false);
    this.size = ModalSize.Large;
    // this.isFullScreen = false;
    this.mustScroll = true;
  }
}

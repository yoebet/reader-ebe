import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ComponentModalConfig, ModalSize, SuiModal} from 'ng2-semantic-ui';

import {ParaSetting} from '../config';
import {Row} from '../content-types/split-align';

@Component({
  selector: 'chap-text-split',
  templateUrl: './chap-text-split.component.html'
})
export class ChapTextSplitComponent {
  rows: Row[];
  editingRow = null;
  editingPart = null;
  splitPat = null;
  splitBy2Lf: boolean;

  saving = false;

  constructor(private modal: SuiModal<ChapTextSplitContext, string[], string>,
              private sanitizer: DomSanitizer) {
    Row.sanitizer = this.sanitizer;
    let context = modal.context;
    this.splitPat = context.splitPat;
    this.splitBy2Lf = this.splitPat.source === ParaSetting.EmptyLineSplitter.source;

    let paraTexts = context.paraTexts;
    if (!paraTexts) {
      paraTexts = context.chapText.split(this.splitPat);
    }
    this.rows = paraTexts.filter(t => t)
      .map(text => {
        let row = new Row();
        row.left = text;
        return row;
      });
  }

  onKeyup(index, $event) {
    $event.stopPropagation();
    let textarea = $event.target;
    if ($event.code !== 'Enter') {
      return;
    }
    let texts = textarea.value.split(this.splitPat);
    if (texts.length === 1) {
      return;
    }

    let rows: Row[] = texts.filter(t => t)
      .map(text => {
        let row = new Row();
        row.left = text;
        return row;
      });

    this.rows.splice(index, 1, ...rows);

    this.editingRow = this.rows[index + 1];
  }

  moveUp(index, $event) {
    let preRow = this.rows[index - 1];
    let thisRow = this.rows[index];

    if (preRow.left && thisRow.left) {
      if (this.splitBy2Lf) {
        preRow.left = preRow.left + '\n';
      }
    }
    preRow.left = preRow.left + thisRow.left;

    this.rows.splice(index, 1);

    this.editingRow = null;
  }

  cancel() {
    this.modal.deny('');
  }

  completeAndSave() {
    let paras = this.rows.map(r => r.left);
    this.modal.approve(paras);
  }

}


export class ChapTextSplitContext {
  chapText: string;
  paraTexts: string[];
  splitPat: RegExp;
}

export class ChapTextSplitModal extends ComponentModalConfig<ChapTextSplitContext> {
  constructor(context: ChapTextSplitContext) {
    super(ChapTextSplitComponent, context, false);
    this.size = ModalSize.Large;
    // this.isFullScreen = true;
    this.mustScroll = true;
  }
}

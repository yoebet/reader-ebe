import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SuiModal, ComponentModalConfig} from 'ng2-semantic-ui';
import {findIndex} from 'lodash';

import {ParaSetting} from '../config';
import {Para} from '../models/para';
import {Row} from '../content-types/split-align';
import {ParaSaver} from '../content-types/para-saver';

@Component({
  selector: 'para-split',
  templateUrl: './para-split.component.html'
})
export class ParaSplitComponent {
  para: Para;
  paraSaver: ParaSaver;
  rows: Row[];
  editingRow = null;
  editingPart = null;
  splitPat = null;
  splitBy2Lf: boolean;
  indentTrans: boolean;
  indentStr = ParaSetting.TransIndentStr;

  saving = false;

  constructor(private modal: SuiModal<ParaSplitContext, Para[], string>, private sanitizer: DomSanitizer) {
    Row.sanitizer = this.sanitizer;
    let context = modal.context;
    this.para = context.para;
    this.paraSaver = context.paraSaver;
    this.splitPat = context.splitPat;
    this.splitBy2Lf = this.splitPat.source === ParaSetting.EmptyLineSplitter;
    this.indentTrans = context.indentTrans;

    let {content, trans} = this.para;
    content = content.trim();
    trans = trans.trim();

    let contents = content.split(this.splitPat);
    let transs = trans.split(this.splitPat);
    this.rows = [];

    let length = Math.max(contents.length, transs.length);
    for (let i = 0; i < length; i++) {
      let left = contents[i] || '';
      let right = transs[i] || '';
      left = left.trim();
      right = right.trim();
      if (!left && !right) {
        continue;
      }
      if (this.indentTrans) {
        if (!right.startsWith(this.indentStr)) {
          right = this.indentStr + right;
        }
      }
      let row = new Row();
      row.left = left;
      row.right = right;
      this.rows.push(row);
    }
  }

  onKeyup(index, part, $event) {
    $event.stopPropagation();
    let textarea = $event.target;
    if ($event.keyCode !== 13) {
      return;
    }
    let texts = textarea.value.split(this.splitPat);
    if (texts.length === 1) {
      return;
    }
    let addedRowCount = texts.length - 1;
    let fixIndex = findIndex(this.rows, r => r.fix, index + 1);
    if (fixIndex === -1) {
      fixIndex = this.rows.length;
    }
    for (let i = fixIndex - 1; i > index; i--) {
      let r = this.rows[i];
      if (r[part] === '' && addedRowCount > 0) {
        addedRowCount--;
      }
    }
    for (let i = index + 1; i < fixIndex; i++) {
      let row = this.rows[i];
      if (row[part] !== '') {
        texts.push(row[part]);
        row[part] = '';
      }
    }
    if (addedRowCount > 0) {
      let newRows = [];
      for (let i = 0; i < addedRowCount; i++) {
        newRows.push(new Row());
      }
      this.rows.splice(index + 1, 0, ...newRows);
    }
    let ri = index;
    for (let text of texts) {
      let r = this.rows[ri];
      r[part] = text;
      ri++;
    }
    this.editingRow = this.rows[index + 1];
  }

  moveUp(index, part, $event) {
    let preRow = this.rows[index - 1];
    let thisRow = this.rows[index];
    if (preRow.fix || thisRow.fix) {
      return;
    }

    if (preRow[part] && thisRow[part]) {
      if (this.splitBy2Lf) {
        preRow[part] = preRow[part] + '\n';
      }
    }
    preRow[part] = preRow[part] + thisRow[part];

    let lastIndex = index;
    for (let i = index; i < this.rows.length - 1; i++) {
      let r1 = this.rows[i];
      let r2 = this.rows[i + 1];
      if (r2.fix) {
        break;
      }
      r1[part] = r2[part];
      lastIndex = i + 1;
    }
    let last = this.rows[lastIndex];
    last[part] = '';
    if (last.left === '' && last.right === '') {
      this.rows.splice(lastIndex, 1);
    }
  }

  cancel() {
    this.modal.deny('');
  }

  completeAndSave() {
    let paras: Para[] = [];
    for (let row of this.rows) {
      let para = new Para();
      para.content = row.left;
      para.trans = row.right;
      paras.push(para);
    }

    this.para.content = paras[0].content;
    this.para.trans = paras[0].trans;
    //keep other fields
    paras[0] = this.para;

    this.saving = true;

    this.paraSaver.saveSplit(paras, () => {
      this.modal.approve(paras);
    });
  }

}


export class ParaSplitContext {
  para: Para;
  paraSaver: ParaSaver;
  splitPat: RegExp;
  indentTrans: boolean;
}

export class ParaSplitModal extends ComponentModalConfig<ParaSplitContext> {
  constructor(context: ParaSplitContext) {
    super(ParaSplitComponent, context, false);
    // this.size = ModalSize.Large;
    this.isFullScreen = true;
    this.mustScroll = true;
  }
}

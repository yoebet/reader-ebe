import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SuiModal, ComponentModalConfig} from 'ng2-semantic-ui'
import {findIndex} from 'lodash';

import {Para} from '../models/para';
import {Row} from '../content-types/split-align';
import {ParaSaver} from '../content-types/para-saver';

@Component({
  selector: 'para-split',
  templateUrl: './para-split.component.html',
  styleUrls: ['./para-split.component.css']
})
export class ParaSplitComponent {
  para: Para;
  paraSaver: ParaSaver;
  rows: Row[];
  editingRow = null;
  editingPart = null;

  constructor(private modal: SuiModal<ParaSplitContext, Para[], string>, private sanitizer: DomSanitizer) {
    Row.sanitizer = this.sanitizer;
    let context = modal.context;
    this.para = context.para;
    this.paraSaver = context.paraSaver;

    let {content, trans} = this.para;

    let splitPat = /\n\n+/;
    let contents = content.split(splitPat);
    let transs = trans.split(splitPat);
    this.rows = [];

    let length = Math.max(contents.length, transs.length);
    for (let i = 0; i < length; i++) {
      let left = contents[i] || '';
      let right = transs[i] || '';
      let row = new Row();
      row.left = left;
      row.right = right;
      this.rows.push(row);
    }
  }

  onKeyup(index, part, $event) {
    $event.stopPropagation();
    let textarea = $event.target;
    let idx = textarea.value.indexOf('\n\n');
    if ($event.keyCode === 13 && idx >= 0) {
      let texts = textarea.value.split(/\n\n+/);
      let addedRowCount = texts.length - 1;
      let fixIndex = findIndex(this.rows, r => r.fix, index + 1);
      if (fixIndex === -1) {
        fixIndex = this.rows.length;
      }
      for (let i = fixIndex - 1; i > index; i--) {
        let r = this.rows[i];
        if (r[part] == '' && addedRowCount > 0) {
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
  }

  moveUp(index, part, $event) {
    let preRow = this.rows[index - 1];
    let thisRow = this.rows[index];
    if (preRow.fix || thisRow.fix) {
      return;
    }

    if (preRow[part] && thisRow[part]) {
      preRow[part] = preRow[part] + '\n';
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
    if (last.left == '' && last.right == '') {
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

    this.paraSaver.saveSplit(paras, () => {
      this.modal.approve(paras);
    });
  }

}


export class ParaSplitContext {
  para: Para;
  paraSaver: ParaSaver;
}

export class ParaSplitModal extends ComponentModalConfig<ParaSplitContext> {
  constructor(context: ParaSplitContext) {
    super(ParaSplitComponent, context, false);
    // this.size = ModalSize.Large;
    this.isFullScreen = true;
    this.mustScroll = true;
  }
}

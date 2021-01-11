import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SuiModal, ComponentModalConfig} from 'ng2-semantic-ui';
import {findIndex} from 'lodash';

import {ParaSetting} from '../config';
import {Chap} from '../models/chap';
import {Row} from '../content-types/split-align';
import {ParaSaver} from '../content-types/para-saver';


class ParaRow extends Row {
  para = null;
}

@Component({
  selector: 'trans-filling',
  templateUrl: './trans-filling.component.html'
})
export class TransFillingComponent {
  chap: Chap;
  paraSaver: ParaSaver;
  rows: ParaRow[];
  editingRow = null;
  indentTrans: boolean;
  indentStr = ParaSetting.TransIndentStr;

  constructor(private modal: SuiModal<TransFillingContext, string, string>, private sanitizer: DomSanitizer) {
    Row.sanitizer = this.sanitizer;
    let context = modal.context;
    this.chap = context.chap;
    this.paraSaver = context.paraSaver;
    this.indentTrans = context.indentTrans;

    this.rows = [];
    let paras = this.chap.paras || [];
    for (let para of paras) {
      let row = new ParaRow();
      row.para = para;
      row.left = para.content;
      row.right = para.trans;
      this.rows.push(row);
    }
  }


  split(index, $event, lf2 = true) {

    let row = this.rows[index];
    if (row.fix) {
      return;
    }

    let fixIndex = findIndex(this.rows, r => r.fix, index + 1);
    if (fixIndex === -1) {
      fixIndex = this.rows.length;
    }
    if (fixIndex === index + 1) {
      return;
    }

    let trans = row.right;
    trans = trans.trim();

    let splitPat = lf2 ? ParaSetting.EmptyLineSplitter : ParaSetting.NewLineSplitter;
    let transs = trans.split(splitPat);
    transs = transs.filter(t => t);
    if (transs.length === 1) {
      return;
    }

    for (let ri = index + 1; ri < fixIndex; ri++) {
      let row2 = this.rows[ri];
      transs.push(row2.right);
      row2.right = '';
    }

    let length = transs.length;
    for (let i = 0; i < length; i++) {
      let right = transs[i];
      right = right.trim();
      if (this.indentTrans) {
        right = this.indentStr + right;
      }
      let rowIndex = index + i;
      if (rowIndex <= fixIndex - 1) {
        let row2 = this.rows[rowIndex];
        row2.right = right;
      } else {
        let row2 = this.rows[fixIndex - 1];
        if (row2.right && right) {
          right = '\n' + right;
        }
        row2.right = row2.right + right;
      }
    }

  }

  moveUp(index, $event) {
    let part = 'right';

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
  }

  edit(row, $event) {
    this.editingRow = row;
  }

  endEdit(index) {
    this.editingRow = null;
  }

  clearTrans() {
    for (let row of this.rows) {
      row.right = '';
    }
  }

  cancel() {
    this.modal.deny('');
  }

  completeAndSave() {
    let idTrans = [];
    for (let row of this.rows) {
      let para = row.para;
      let trans = row._right;
      if (trans !== para.trans) {
        idTrans.push({_id: para._id, trans});
      }
    }
    if (idTrans.length === 0) {
      this.modal.approve('');
      return;
    }

    this.paraSaver.updateTrans(this.chap, idTrans, () => {
      this.modal.approve('');
      alert('修改：' + idTrans.length);
    });
  }

}


export class TransFillingContext {
  chap: Chap;
  paraSaver: ParaSaver;
  indentTrans: boolean;
}

export class TransFilingModal extends ComponentModalConfig<TransFillingContext> {
  constructor(context: TransFillingContext) {
    super(TransFillingComponent, context, false);
    // this.size = ModalSize.Large;
    this.isFullScreen = true;
    this.mustScroll = true;
  }
}

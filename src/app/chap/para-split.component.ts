import {Component, ViewChild, ViewContainerRef, AfterContentChecked} from '@angular/core';
import {SuiModal, ComponentModalConfig, ModalSize} from "ng2-semantic-ui"

import {Para} from '../models/para';

class Row {
  left: string = '';
  right: string = '';
}

@Component({
  selector: 'para-split',
  templateUrl: './para-split.component.html',
  styleUrls: ['./para-split.component.css']
})
export class ParaSplitComponent implements AfterContentChecked {
  @ViewChild('parasGrid', {read: ViewContainerRef}) parasGrid: ViewContainerRef;
  rows: Row[];
  beenResetTextarea = false;

  constructor(private modal: SuiModal<Para, Para[], string>) {
    let {content, trans} = modal.context;
    let splitPat = /\n\n+/;
    let contents = content.split(splitPat);
    let transs = trans.split(splitPat);
    this.rows = [];

    let length = Math.max(contents.length, transs.length);
    for (let i = 0; i < length; i++) {
      let left = contents[i] || '';
      let right = transs[i] || '';
      let row = {left, right} as Row;
      this.rows.push(row);
    }
  }

  onKeyup(index, part, $event) {
    let textarea = $event.target;
    let idx = textarea.value.indexOf('\n\n');
    if ($event.keyCode === 13 && idx >= 0) {
      let texts = textarea.value.split(/\n\n+/);
      let addedRowCount = texts.length - 1;
      let lastRow = this.rows[this.rows.length - 1];
      if (lastRow[part] == '') {
        addedRowCount--;
      }
      for (let i = index + 1; i < this.rows.length; i++) {
        let row = this.rows[i];
        texts.push(row[part]);
      }
      for (let i = 0; i < addedRowCount; i++) {
        this.rows.push(new Row());
      }
      for (let i = index; i < this.rows.length; i++) {
        let row = this.rows[i];
        row[part] = texts[i - index];
      }

      this.beenResetTextarea = false;
    }
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }


  onBlur(index, part, $event) {
    let textarea = $event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  private mergeRow(row1, row2, part) {
    if (row1[part] && row2[part]) {
      row1[part] = row1[part] + '\n';
    }
    row1[part] = row1[part] + row2[part];
  }

  moveUp(index, part) {
    let preRow = this.rows[index - 1];
    let thisRow = this.rows[index];
    this.mergeRow(preRow, thisRow, part);
    for (let i = index; i < this.rows.length - 1; i++) {
      let r1 = this.rows[i];
      let r2 = this.rows[i + 1];
      r1[part] = r2[part];
    }
    let last = this.rows[this.rows.length - 1];
    last[part] = '';
    if (last.left == '' && last.right == '') {
      this.rows.pop();
    }

    this.beenResetTextarea = false;
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
    this.modal.approve(paras);
  }

  private resetTextareaHeight() {
    let pgEl = this.parasGrid.element.nativeElement;
    let ts = pgEl.querySelectorAll('textarea');
    let set = false;
    for (let textarea of ts) {
      let o = textarea.style.height;
      let n = textarea.scrollHeight;
      if (n == 0) {
        continue;
      }
      if (n == o) {
        continue;
      }
      set = true;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
    return set;
  }

  ngAfterContentChecked() {
    if (this.beenResetTextarea) {
      return;
    }
    this.beenResetTextarea = this.resetTextareaHeight();
  }

}

export class ParaSplitModal extends ComponentModalConfig<Para> {
  constructor(para: Para) {
    super(ParaSplitComponent, para, false);
    this.size = ModalSize.Large;
    this.mustScroll = true;
  }
}

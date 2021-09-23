import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SuiModal, ComponentModalConfig} from 'ng2-semantic-ui';
import {differenceBy, isEqual, findIndex} from 'lodash';

import {Para} from '../models/para';
import {Model} from '../models/model';
import {Row} from '../content-types/split-align';
import {ParaSaver} from '../content-types/para-saver';

class SentenceRow extends Row {
  sid = null;
}

@Component({
  selector: 'para-split',
  templateUrl: './sentence-align.component.html'
})
export class SentenceAlignComponent {
  rows: SentenceRow[];
  para: Para;
  paraSaver: ParaSaver;

  endingPattern = /[.?!:;。．？！：；…]+['"＇＂’”]* *\n?/g;
  endingPattern2 = /[，,]+['"＇＂’”]*\n?/g;
  splitMark = '-=SPL=-';
  editingRow = null;
  editingPart = null;

  constructor(private modal: SuiModal<SentenceAlignContext, Para, string>, private sanitizer: DomSanitizer) {
    Row.sanitizer = this.sanitizer;
    let context = modal.context;
    this.para = context.para;
    this.paraSaver = context.paraSaver;
    this.setup();
  }

  setup() {
    let contentSents = this.splitSentences(this.para.content || '', this.endingPattern, 'left');
    let transSents = this.splitSentences(this.para.trans || '', this.endingPattern, 'right');

    let css = contentSents.filter(s => s.sid);
    let tss = transSents.filter(s => s.sid);

    if (css.length > 0 || tss.length > 0) {
      let ctd = differenceBy(css, tss, 'sid');
      let tcd = differenceBy(tss, css, 'sid');
      ctd.forEach(s => s.sid = null);
      tcd.forEach(s => s.sid = null);

      css = contentSents.filter(s => s.sid);
      tss = transSents.filter(s => s.sid);

      if (css.length > 0 || tss.length > 0) {
        let csids = css.map(s => s.sid);
        let tsids = tss.map(s => s.sid);
        if (!isEqual(csids, tsids)) {
          css.forEach(s => s.sid = null);
          tss.forEach(s => s.sid = null);
        }
      }
    }

    let clen = contentSents.length;
    let tlen = transSents.length;
    let ci = 0, ti = 0;

    this.rows = [];
    while (ci <= clen - 1 || ti <= tlen - 1) {
      let cs = contentSents[ci];
      let ts = transSents[ti];
      let row = new SentenceRow();
      if (cs && ts && cs.sid === ts.sid) {
        row.left = cs.text;
        row.right = ts.text;
        row.sid = cs.sid;
        if (row.sid) {
          row.fix = true;
        }
        ci++;
        ti++;
      } else {
        if (cs && ts && cs.sid && ts.sid) {
          console.log('Shouldn\'t Happen.');
          break;
        }
        if (cs && !cs.sid) {
          row.left = cs.text;
          ci++;
        } else if (ts && !ts.sid) {
          row.right = ts.text;
          ti++;
        }
      }
      this.rows.push(row);
    }
  }


  private splitText(text: string, endingPattern, part = 'left') {
    let holder = document.createElement('div');
    holder.innerHTML = text;

    let cns = Array.from(holder.childNodes);
    for (let node of cns) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        node.textContent =
          node.textContent.replace(endingPattern, punt => punt + this.splitMark);
      }
    }
    text = holder.innerHTML;

    let sts = text.split(this.splitMark);
    sts = sts.filter(f => f.trim() !== '');

    if (endingPattern === this.endingPattern) {
      let lastIndex = 0;
      for (let thisIndex = lastIndex + 1; thisIndex < sts.length; thisIndex++) {
        let lastText = sts[lastIndex];
        let thisText = sts[thisIndex];
        let thisTrimmedText = thisText.trim();
        if (thisTrimmedText.length <= 2 && /[a-zA-Z]?\./.test(thisTrimmedText)) {
          sts[lastIndex] = lastText + thisText;
          sts[thisIndex] = '';
          continue;
        }
        if (part === 'left') {
          if (/['"’]\s*$/.test(lastText)) {
            if (/^ *((he|she|I) +)?(said|asked|demanded) /.test(thisText)) {
              sts[lastIndex] = lastText + thisText;
              sts[thisIndex] = '';
              continue;
            }
          }
          // Mrs. Arable said goodbye and thanked Dr. Dorian very much for his advice. She felt greatly relieved.
          if (/(Mrs?|Miss|Dr)\. *$/.test(lastText)) {
            sts[lastIndex] = lastText + thisText;
            sts[thisIndex] = '';
            continue;
          }
        }
        lastIndex = thisIndex;
      }

      sts = sts.filter(f => f.trim() !== '');
    }

    return sts;
  }

  private splitSentences(text: string, endingPattern, part) {
    text = text.replace(/<s-st[ >]/g, tagOpen => this.splitMark + tagOpen);
    text = text.replace(/<\/s-st>/g, tagClose => tagClose + this.splitMark);

    let sts = this.splitText(text, endingPattern, part);

    return sts.map(st => {
      let sentence: any = {text: st, sid: null};
      if (/^<s-st[ >]/.test(st)) {
        let m = st.match(/ data-sid="(\d+)"/);
        if (m) {
          sentence.sid = parseInt(m[1]);
        }
        st = st.replace(/^<s-st[^>]*>/, '');
        st = st.replace(/<\/s-st>$/, '');
        sentence.text = st;
      }
      return sentence;
    });
  }

  moveUp(index, part, $event) {
    let preRow = this.rows[index - 1];
    let thisRow = this.rows[index];
    if (preRow.fix || thisRow.fix) {
      return;
    }

    if (this.editingRow !== null && this.editingPart === part) {
      let editingIndex = this.rows.findIndex(row => row === this.editingRow);
      if (editingIndex >= index - 1) {
        this.endEdit(index, part);
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


  split(index, part, $event, finner = false) {
    let row = this.rows[index];
    if (row.fix) {
      return;
    }

    if (this.editingRow !== null && this.editingPart === part) {
      let editingIndex = this.rows.findIndex(row2 => row2 === this.editingRow);
      if (editingIndex >= index) {
        this.endEdit(index, part);
      }
    }

    let text = row[part];
    let ep = finner ? this.endingPattern2 : this.endingPattern;
    let sts = this.splitText(text, ep, part);
    if (sts.length === 1) {
      return;
    }

    let addedRows = sts.length - 1;

    let fixIndex = findIndex(this.rows, r => r.fix, index + 1);
    if (fixIndex === -1) {
      fixIndex = this.rows.length;
    }
    let emptyRowCount = 0;
    for (let i = index + 1; i < fixIndex; i++) {
      let row2 = this.rows[i];
      if (row2[part] === '') {
        emptyRowCount++;
      } else {
        sts.push(row2[part]);
        row2[part] = '';
      }
    }
    let newRowCount = addedRows - emptyRowCount;
    if (newRowCount > 0) {
      let newRows = [];
      for (let i = 0; i < newRowCount; i++) {
        newRows.push(new SentenceRow());
      }
      this.rows.splice(fixIndex, 0, ...newRows);
    }

    let ri = index;
    for (let st of sts) {
      let r = this.rows[ri];
      r[part] = st;
      ri++;
    }
  }

  edit(row, part, $event) {
    this.editingRow = row;
    this.editingPart = part;
  }

  endEdit(index, part) {
    this.editingRow = null;
    this.editingPart = null;
  }

  cancel() {
    this.modal.deny('');
  }

  completeAndSave() {
    let maxSid = 0;
    this.rows.forEach(row => {
      let sid = row.sid;
      if (sid) {
        if (isNaN(sid)) {
          return;
        }
        if (sid > maxSid) {
          maxSid = sid;
        }
      }
    });

    let contentText = '';
    let transText = '';
    let nextSid = maxSid + 1;
    if (nextSid === 1) {
      let seq = Model.sequenceNo(this.para._id, 1);
      nextSid = (seq << 5) + 1;
    }
    for (let row of this.rows) {
      let {left, right, sid} = row;
      if (left === '' && right === '') {
        continue;
      }
      if (!sid || isNaN(sid)) {
        sid = nextSid;
        nextSid++;
      }
      left = `<s-st data-sid="${sid}">${left}</s-st>`;
      contentText = contentText + left;
      right = `<s-st data-sid="${sid}">${right}</s-st>`;
      transText = transText + right;
    }

    this.para.content = contentText;
    this.para.trans = transText;

    this.paraSaver.save(this.para, () => {
      this.modal.approve(this.para);
    });
  }

}


export class SentenceAlignContext {
  para: Para;
  paraSaver: ParaSaver;
}

export class SentenceAlignModal extends ComponentModalConfig<SentenceAlignContext> {
  constructor(context: SentenceAlignContext) {
    super(SentenceAlignComponent, context, false);
    // this.size = ModalSize.Large;
    this.isFullScreen = true;
    this.mustScroll = true;
  }
}

import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {SuiModal, ComponentModalConfig} from "ng2-semantic-ui";
import {differenceBy, isEqual, findIndex} from 'lodash';

import {Para} from '../models/para';
import {Model} from '../models/model';
import {Row} from '../chap-types/split-align';

class SentenceRow extends Row {
  sid = null;
}

@Component({
  selector: 'para-split',
  templateUrl: './sentence-align.component.html',
  styleUrls: ['./sentence-align.component.css']
})
export class SentenceAlignComponent {
  rows: SentenceRow[];
  para: Para;
  endingPatternEn = /[.．?!\n]+['"’\n]?/g;
  endingPatternZh = /[.?!。？！；\n]+['"＇＂’”\n]?/g;
  endingPatternZh2 = /[，,\n]+['"＇＂’”\n]?/g;
  splitMark = '-=SPL=-';

  constructor(private modal: SuiModal<Para, Para, string>, private sanitizer: DomSanitizer) {
    Row.sanitizer = this.sanitizer;
    this.para = modal.context;
    this.setup();
  }

  setup() {
    let contentSents = this.splitSentences(this.para.content, this.endingPatternEn);
    let transSents = this.splitSentences(this.para.trans, this.endingPatternZh);

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
      if (cs && ts && cs.sid == ts.sid) {
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
          console.log("shouldn't happen");
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


  private splitText(text: string, endingPattern) {
    let holder = document.createElement('div');
    holder.innerHTML = text;

    let cns = Array.from(holder.childNodes);
    for (let node of cns) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent =
          node.textContent.replace(endingPattern, punt => punt + this.splitMark);
      }
    }
    text = holder.innerHTML;

    let sts = text.split(this.splitMark);
    sts = sts.filter(f => f.trim() !== '');

    if (endingPattern === this.endingPatternEn) {
      for (let i = 1; i < sts.length; i++) {
        let lastText = sts[i - 1];
        let thisText = sts[i];
        if (/['"’]\s*$/.test(lastText)) {
          if (/^\s*(said|asked) /.test(thisText)) {
            lastText = lastText + thisText;
            sts[i - 1] = lastText;
            sts[i] = '';
          }
        }
      }
      sts = sts.filter(f => f.trim() !== '');
    }

    return sts;
  }

  private splitSentences(text: string, endingPattern) {
    text = text.replace(/<s-st[ >]/g, tagOpen => this.splitMark + tagOpen);
    text = text.replace(/<\/s-st>/g, tagClose => tagClose + this.splitMark);

    let sts = this.splitText(text, endingPattern);

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


  split(index, part, $event, finner = false) {
    let row = this.rows[index];
    if (row.fix) {
      return;
    }
    let text = row[part];
    let ep = (part === 'left') ? this.endingPatternEn : (finner ? this.endingPatternZh2 : this.endingPatternZh);
    let sts = this.splitText(text, ep);
    if (sts.length === 1) {
      return;
    }

    let fixIndex = findIndex(this.rows, r => r.fix, index + 1);
    if (fixIndex === -1) {
      fixIndex = this.rows.length;
    }
    let emptyRowCount = 0;
    for (let i = fixIndex - 1; i > index; i--) {
      let r = this.rows[i];
      if (r[part] === '') {
        emptyRowCount++;
      }
    }
    if (emptyRowCount > 0) {
      for (let i = index + 1; i < fixIndex; i++) {
        let row = this.rows[i];
        if (row[part] !== '') {
          sts.push(row[part]);
          row[part] = '';
        }
      }
    }
    let newRowCount = sts.length - 1 - emptyRowCount;
    if (newRowCount > 0) {
      let newRows = [];
      for (let i = 0; i < newRowCount; i++) {
        newRows.push(new SentenceRow());
      }
      this.rows.splice(index + 1, 0, ...newRows);
    }

    let ri = index;
    for (let st of sts) {
      let r = this.rows[ri];
      r[part] = st;
      ri++;
    }
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
      nextSid = seq * 10 + 1;
    }
    for (let row of this.rows) {
      let {left, right, sid} = row;
      if (left === '') {
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

    this.modal.approve(this.para);
  }

}

export class SentenceAlignModal extends ComponentModalConfig<Para> {
  constructor(para: Para) {
    super(SentenceAlignComponent, para, false);
    // this.size = ModalSize.Large;
    this.isFullScreen = true;
    this.mustScroll = true;
  }
}

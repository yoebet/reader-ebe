import {Component, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal, SuiModalService} from 'ng2-semantic-ui';

import {Book} from '../models/book';
import {ChapService} from '../services/chap.service';
import {ParaService} from '../services/para.service';
import {ChapTextEditContext, ChapTextEditModal} from './chap-text-edit.component';
import {ChapTextSplitContext, ChapTextSplitModal} from './chap-text-split.component';
import {ParaSetting} from '../config';
import {Chap} from '../models/chap';
import {Para} from '../models/para';


interface TextStat {
  length: number;
  lineCount: number;
  nonEmptyLineCount: number;
  textSummary: string;
}

interface ChapHolder {
  chapText: string;
  titleLine: string;
  chapTitle?: string;
  textStat: TextStat;

  paraTexts?: string[];
  saved?: boolean;
}

const ChapSplitter = '-2345-CS-YW-';
const ChapTitleSplitter = '-6789-TS-YW-';

@Component({
  selector: 'book-import',
  templateUrl: './book-import.component.html',
  styleUrls: ['./book-import.component.css']
})
export class BookImportComponent implements OnInit {
  book: Book;

  chapTitleLinePattern: string;
  chapTitlePattern: string;

  bookText: string;
  bookTextStat: TextStat;
  chapHolders: ChapHolder[];

  editingChapTitle: ChapHolder;
  saving = false;

  splitParaBy2Lf = true;

  step: 'paste-book-text' | 'split-chaps' | 'split-paras' | 'save-chaps' = 'paste-book-text';


  constructor(private chapService: ChapService,
              private paraService: ParaService,
              private modalService: SuiModalService,
              private modal: SuiModal<BookImportContext, string, string>) {
    let context = modal.context;
    this.book = context.book;
  }

  ngOnInit(): void {
  }

  editChapTitle(chapHolder: ChapHolder) {
    this.editingChapTitle = chapHolder;
    if (!chapHolder.chapTitle) {
      chapHolder.chapTitle = chapHolder.titleLine;
    }
  }

  completeEditChapTitle() {
    this.editingChapTitle = null;
  }

  splitChaps() {

    let pattern = this.chapTitleLinePattern;
    let flags = 'gm';
    if (pattern.startsWith('/')) {
      pattern = pattern.substr(1);
      let lsi = pattern.lastIndexOf('/');
      if (lsi > 0) {
        flags = pattern.substr(lsi + 1);
        pattern = pattern.substr(0, lsi);
        if (flags.indexOf('m') === -1) {
          flags = 'm' + flags;
        }
        if (flags.indexOf('g') === -1) {
          flags = 'g' + flags;
        }
      }
    }

    let regex = new RegExp(pattern, flags);

    let text = this.bookText.replace(regex, ((tl, args) => `${ChapSplitter}${tl}${ChapTitleSplitter}`));

    let titleAndTexts = text.split(ChapSplitter);

    let chapHolders: ChapHolder[] = [];
    for (let titleAndText of titleAndTexts) {
      titleAndText = titleAndText.trim();
      if (!titleAndText) {
        continue;
      }
      let titleLine = '', chapText;
      if (titleAndText.indexOf(ChapTitleSplitter) === -1) {
        chapText = titleAndText;
      } else {
        [titleLine, chapText] = titleAndText.split(ChapTitleSplitter);
        titleLine = titleLine.trim();
        chapText = chapText.trim();
      }
      let textStat = this.statisticText(chapText);
      chapHolders.push({titleLine, chapText, textStat});
    }

    this.chapHolders = chapHolders;
  }

  statisticText(text: string): TextStat {
    let stat: TextStat = {length: text.length, lineCount: 0, nonEmptyLineCount: 0, textSummary: ''};
    if (!text) {
      return stat;
    }
    let lines = text.split(/\r\n|\r|\n/);
    stat.lineCount = lines.length;
    lines = lines.filter(l => l);
    stat.nonEmptyLineCount = lines.length;
    let firstLine = lines[0];
    let textSummary;
    if (lines.length > 1) {
      let lastLine = lines[lines.length - 1];
      textSummary = `${firstLine}\n......\n${lastLine}`;
    } else {
      textSummary = firstLine;
    }
    stat.textSummary = textSummary;
    return stat;
  }

  removeChap(chapHolder) {
    if (!confirm('要移除吗？')) {
      return;
    }
    let index = this.chapHolders.indexOf(chapHolder);
    this.chapHolders.splice(index, 1);
  }

  extractChapTitles() {
    if (!this.chapTitlePattern || !this.chapHolders) {
      return;
    }
    let pattern = this.chapTitlePattern;
    let flags = '';
    if (pattern.startsWith('/')) {
      pattern = pattern.substr(1);
      let lsi = pattern.lastIndexOf('/');
      if (lsi > 0) {
        flags = pattern.substr(lsi + 1);
        pattern = pattern.substr(0, lsi);
      }
    }
    let regex = new RegExp(pattern, flags);

    for (let ch of this.chapHolders) {
      let matcher = ch.titleLine.match(regex);
      if (matcher) {
        ch.chapTitle = matcher[1] || matcher[0];
      }
    }
  }

  resetChapTitles() {
    if (!this.chapHolders) {
      return;
    }
    for (let ch of this.chapHolders) {
      ch.chapTitle = null;
    }
  }


  splitParas() {
    if (!this.chapHolders) {
      return;
    }
    let splitPat = this.splitParaBy2Lf ? ParaSetting.EmptyLineSplitter : ParaSetting.NewLineSplitter;
    for (let ch of this.chapHolders) {
      ch.paraTexts = ch.chapText.split(splitPat).filter(t => t);
    }
  }

  showParas(chapHolder: ChapHolder) {
    let context = new ChapTextSplitContext();
    context.paraTexts = chapHolder.paraTexts;
    context.chapText = chapHolder.chapText;
    context.splitPat = this.splitParaBy2Lf ? ParaSetting.EmptyLineSplitter : ParaSetting.NewLineSplitter;

    this.modalService.open(new ChapTextSplitModal(context))
      .onApprove((paras: string[]) => {
        if (paras) {
          chapHolder.paraTexts = paras;
        }
      });
  }

  goBackStepPasteBookText() {
    this.step = 'paste-book-text';
  }

  goToStepSplitChaps() {
    this.step = 'split-chaps';
    this.bookTextStat = this.statisticText(this.bookText);
  }

  goBackStepSplitChaps() {
    this.step = 'split-chaps';
  }

  goToStepSplitParas() {
    this.step = 'split-paras';
  }


  async saveAll() {

    let splitPat = this.splitParaBy2Lf ? ParaSetting.EmptyLineSplitter : ParaSetting.NewLineSplitter;

    let savedChapsCount = 0;
    let saveParasCount = 0;

    this.saving = true;

    for (let ch of this.chapHolders) {
      let chapTitle = ch.chapTitle || ch.titleLine;
      if (!chapTitle) {
        continue;
      }

      let chap = new Chap();
      delete chap.paras;
      chap.name = chapTitle;
      chap.bookId = this.book._id;

      try {
        chap = await this.chapService.create(chap).toPromise();
      } catch (e) {
        console.log(e);
        alert('保存章节失败');
        this.saving = false;
        return;
      }
      savedChapsCount++;
      ch.saved = true;
      this.book.chaps.push(chap);

      if (!ch.paraTexts) {
        ch.paraTexts = ch.chapText.split(splitPat).filter(t => t);
      }

      let paras: Para[] = ch.paraTexts.map(content => {
        let para = new Para();
        para.bookId = chap.bookId;
        para.chapId = chap._id;
        para.content = content;
        return para;
      });

      try {
        // 413?
        await this.paraService.createMany(paras).toPromise();
      } catch (e) {
        console.log(e);
        alert('保存段落内容失败');
        this.saving = false;
        return;
      }
      saveParasCount += paras.length;
    }

    alert(`保存成功。章节数：${savedChapsCount}，段落数：${saveParasCount}`);

    this.modal.approve('');
  }

  showChapText(chapHolder: ChapHolder) {
    let context = new ChapTextEditContext();
    context.allowEdit = false;
    context.chapText = chapHolder.chapText;
    context.chapTitle = chapHolder.chapTitle || chapHolder.titleLine;

    this.modalService.open(new ChapTextEditModal(context));
  }

  editChapText(chapHolder: ChapHolder) {
    let context = new ChapTextEditContext();
    context.directEdit = true;
    context.chapText = chapHolder.chapText;
    context.chapTitle = chapHolder.chapTitle || chapHolder.titleLine;

    this.modalService.open(new ChapTextEditModal(context))
      .onApprove((text: string) => {
        if (text) {
          chapHolder.chapText = text;
          chapHolder.textStat = this.statisticText(text);
        }
      });
  }

  close() {
    //
    if (!this.bookText || confirm('要取消吗？')) {
      this.modal.approve('');
    }
  }
}

export class BookImportContext {
  book: Book;
}

export class BookImportModal extends ComponentModalConfig<BookImportContext> {
  constructor(context: BookImportContext) {
    super(BookImportComponent, context, false);
    // this.size = ModalSize.Large;
    this.isFullScreen = true;
    this.mustScroll = true;
  }
}

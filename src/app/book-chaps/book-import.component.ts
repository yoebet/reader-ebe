import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';

import {Book} from '../models/book';
import {ChapService} from '../services/chap.service';
import {ParaService} from '../services/para.service';


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
}

const ChapSplitter = '-2345-CS-YW-';
const ChapTitleSplitter = '-6789-TS-YW-';

@Component({
  selector: 'book-import',
  templateUrl: './book-import.component.html',
  styleUrls: ['./book-import.component.css']
})
export class BookImportComponent implements OnInit {
  @Input() book: Book;

  chapTitleLinePattern: string;
  chapTitlePattern: string;

  bookText: string;
  bookTextStat: TextStat;
  chapHolders: ChapHolder[];

  step: 'paste-book-text' | 'split-chaps' | 'edit-chaps' | 'save-chaps' = 'paste-book-text';


  constructor(private chapService: ChapService,
              protected paraService: ParaService,
              private modal: SuiModal<BookImportContext, string, string>) {
    let context = modal.context;
    this.book = context.book;
  }

  ngOnInit(): void {
  }

  editChapTitle(chapHolder) {

  }

  edit(chap) {

  }

  splitChaps() {

    console.log('>>>>');

    let regex = new RegExp(this.chapTitleLinePattern, 'g');

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
      textSummary = `${firstLine}\r\n......\r\n${lastLine}`;
    } else {
      textSummary = firstLine;
    }
    stat.textSummary = textSummary;
    return stat;
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

  goToStepEditChaps() {
    this.step = 'edit-chaps';
  }


  save() {
    this.modal.approve('');
  }

  close() {
    //
    if (!this.bookText || confirm('要取消操作吗？')) {
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

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

import {UIConstants} from '../config';
import {Para} from '../models/para';
import {ParaService} from '../services/para.service';
import {SafeHtml} from "@angular/platform-browser/src/security/dom_sanitization_service";

@Component({
  selector: 'quoted-text',
  templateUrl: './quoted-text.component.html',
  styleUrls: ['./quoted-text.component.css']
})
export class QuotedTextComponent implements OnChanges {
  @Input() paraQuote: { paraId: string, sentenceId: string };
  @Input() textTrans: boolean;
  @Input() showTitle: boolean;

  para: Para;
  showText: boolean;

  sanitizedContent: SafeHtml;
  sanitizedTrans: SafeHtml;

  constructor(private paraService: ParaService,
              private sanitizer: DomSanitizer) {
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.textTrans && this.para) {
      this.loadText();
    }
  }

  toggleText() {
    this.showText = !this.showText;
    if (this.showText && !this.para) {
      this.loadText();
    }
  }

  loadText() {
    let quote = this.paraQuote;
    if (!quote || !quote.paraId) {
      return;
    }
    if (this.para && this.para._id == quote.paraId) {
      this.highlightSentence(this.para, quote.sentenceId);
      return;
    }
    this.paraService.loadPara(quote.paraId)
      .subscribe((para: Para) => {
        this.para = para;
        this.highlightSentence(para, quote.sentenceId);
      });
  }


  highlight(html, sentenceId) {
    if (!html || !sentenceId) {
      return html;
    }
    let holder = document.createElement('div');
    holder.innerHTML = html;
    let selector = UIConstants.sentenceTagName + '[data-sid="' + sentenceId + '"]';
    let sentenceEl = holder.querySelector(selector);
    if (sentenceEl) {
      sentenceEl.classList.add(UIConstants.highlightClass);
      html = holder.innerHTML;
    }
    return html;
  }

  highlightSentence(para: Para, sentenceId: string) {
    let content = this.highlight(para.content, sentenceId);
    let trans;

    if (this.textTrans) {
      trans = this.highlight(para.trans, sentenceId);
    }
    trans = trans || '';

    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);
    this.sanitizedTrans = this.sanitizer.bypassSecurityTrustHtml(trans);
  }

}

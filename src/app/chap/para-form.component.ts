import {Component, Input, ViewChild, ElementRef, OnInit} from '@angular/core';
import {SuiModalService} from 'ng2-semantic-ui';

import {Para} from '../models/para';
import {ParaSplitContext, ParaSplitModal} from './para-split.component';
import {SentenceAlignContext, SentenceAlignModal} from '../content/sentence-align.component';
import {ParaSaver} from '../content-types/para-saver';

@Component({
  selector: 'para-form',
  templateUrl: './para-form.component.html',
  styleUrls: ['./para-form.component.css']
})
export class ParaFormComponent implements OnInit {
  @ViewChild('content') contentEl: ElementRef;
  @Input() para: Para;
  @Input() showTrans: boolean;
  @Input() paraSaver: ParaSaver;

  constructor(public modalService: SuiModalService) {
  }

  ngOnInit(): void {
    if (this.para) {
      // deep clone
      this.para = JSON.parse(JSON.stringify(this.para));
      if (!this.para.trans) {
        this.para.trans = '';
      }
    } else {
      this.para = new Para();
    }
    this.contentEl.nativeElement.focus();
  }

  clear() {
    this.para.content = '';
    this.para.trans = '';
    this.contentEl.nativeElement.focus();
  }

  save() {
    //TODO: check html
    this.paraSaver.save(this.para, null);
  }

  cancel() {
    this.paraSaver.cancelEdit();
  }

  splitParasByLflf() {
    let context: ParaSplitContext = {para: this.para, paraSaver: this.paraSaver, splitPat: /\n\n+/};
    this.modalService
      .open(new ParaSplitModal(context))
      // .onDeny((d) => {})
      .onApprove((paras: Para[]) => {
      });
  }

  splitParasByLf() {
    let context: ParaSplitContext = {para: this.para, paraSaver: this.paraSaver, splitPat: /\n+/};
    this.modalService
      .open(new ParaSplitModal(context))
      // .onDeny((d) => {})
      .onApprove((paras: Para[]) => {
      });
  }

  alignSentences() {
    let context: SentenceAlignContext = {para: this.para, paraSaver: this.paraSaver};
    this.modalService
      .open(new SentenceAlignModal(context))
      // .onDeny((d) => {})
      .onApprove((para: Para) => {
      });
  }

}

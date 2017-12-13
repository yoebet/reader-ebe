import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit} from '@angular/core';
import {SuiModalService} from 'ng2-semantic-ui';

import {Para} from '../models/para';
import {ParaSplitModal} from './para-split.component';
import {SentenceAlignModal} from '../content/sentence-align.component';

@Component({
  selector: 'para-form',
  templateUrl: './para-form.component.html',
  styleUrls: ['./para-form.component.css']
})
export class ParaFormComponent implements OnInit {
  @ViewChild('content') contentEl: ElementRef;
  @Input() para: Para;
  @Input() showTrans: boolean;
  @Output() onSave = new EventEmitter<Para>();
  @Output() onSplit = new EventEmitter<Para[]>();
  @Output() onCancel = new EventEmitter();

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
    this.onSave.emit(this.para);
  }

  cancel() {
    this.onCancel.emit();
  }

  splitParas() {
    this.modalService
      .open(new ParaSplitModal(this.para))
      // .onDeny((d) => {})
      .onApprove((paras: Para[]) => {
        this.para.content = paras[0].content;
        this.para.trans = paras[0].trans;
        //keep other fields
        paras[0] = this.para;
        this.onSplit.emit(paras);
      });
  }

  alignSentences() {
    this.modalService
      .open(new SentenceAlignModal(this.para))
      // .onDeny((d) => {})
      .onApprove((para: Para) => {
        this.onSave.emit(para);
      });
  }

}

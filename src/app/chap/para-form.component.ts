import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {Chap} from '../models/chap';
import {Para} from '../models/para';

@Component({
  selector: 'para-form',
  templateUrl: './para-form.component.html',
  styleUrls: ['./para-form.component.css']
})
export class ParaFormComponent implements OnInit {
  @ViewChild('content') contentEl: ElementRef;
  @Input() para: Para;
  @Output() onSave = new EventEmitter<Para>();
  @Output() onCancel = new EventEmitter();

  ngOnInit(): void {
    if (this.para) {
      let ip = this.para;
      this.para = new Para();
      Object.assign(this.para, ip);
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
    this.onSave.emit(this.para);
  }

  cancel() {
    this.onCancel.emit();
  }
}

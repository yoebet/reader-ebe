import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit} from '@angular/core';
import 'rxjs/add/operator/switchMap';

import {Para} from '../models/para';

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
  @Output() onCancel = new EventEmitter();

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
}

import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {Chap} from '../models/chap';
import {Para} from '../models/para';
import {ChapService} from '../services/chap.service';
import {ParaService} from '../services/para.service';
import {OpResult} from '../models/op-result';

const LF = '\n';

@Component({
  selector: 'chap-paras',
  templateUrl: './chap-paras.component.html',
  styleUrls: ['./chap-paras.component.css']
})
export class ChapParasComponent implements OnInit {
  @Input() chap: Chap;
  editingPara: Para;
  insertPos: number;

  constructor(private chapService: ChapService,
              private paraService: ParaService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    if (!this.chap.paras) {
      this.chap.paras = [];
    }
  }

  append(content: string): void {
    let model = {content} as Para;
    model.chapId = this.chap._id;
    this.paraService.create(model)
      .subscribe(para => {
        this.chap.paras.push(para);
      });
  }

  remove(para: Para): void {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.paraService
      .remove(para._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.chap.paras = this.chap.paras.filter(h => h !== para);
      });
  }

  edit(para: Para): void {
    this.editingPara = para;
  }

  save(content): void {
    this.editingPara.content = content;
    this.paraService.update(this.editingPara)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.editingPara = null;
      });
  }

  insertBeforeEdit(index: number) {
    this.insertPos = index;
  }

  insertBeforeSave(index: number, content: string) {
    let target = this.chap.paras[index];
    let model = {content} as Para;
    model.chapId = this.chap._id;
    this.paraService.createBefore(target._id, model)
      .subscribe(para => {
        if (!para._id) {
          alert('Fail');
          return;
        }
        this.chap.paras.splice(index, 0, model);
        this.insertPos = null;
      });
  }

  private mergeContent(p1, p2, target) {
    let {content: content1, trans: trans1} = p1;
    let {content: content2, trans: trans2} = p2;
    let content = content1 + LF + content2;
    let trans;
    if (trans1 || trans2) {
      if (!trans1) {
        trans = trans2;
      } else if (trans2) {
        trans = trans1 + LF + trans2;
      }
    }
    target.content = content;
    target.trans = trans;
  }

  private saveMerge(targetPara, removePara) {
    this.paraService.update(targetPara).subscribe((opr: OpResult) => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail To Save');
        return;
      }
    });
    this.paraService.remove(removePara._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail To Remove');
          return;
        }
        this.chap.paras = this.chap.paras.filter(h => h !== removePara);
      });

  }

  mergeUp(index: number): void {
    let paras = this.chap.paras;
    let removePara = paras[index];
    let targetPara = paras[index - 1];
    this.mergeContent(targetPara, removePara, targetPara);
    this.saveMerge(targetPara, removePara);
  }

  mergeDown(index: number): void {
    let paras = this.chap.paras;
    let removePara = paras[index];
    let targetPara = paras[index + 1];
    this.mergeContent(removePara, targetPara, targetPara);
    this.saveMerge(targetPara, removePara);
  }

  paraTracker(index, para) {
    return para._id;
  }

}

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
  selectedPara: Para;
  insertPos: number;
  editButtons: false;

  constructor(private chapService: ChapService,
              private paraService: ParaService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    if (!this.chap.paras) {
      this.chap.paras = [];
    }
  }

  selectPara(para): void {
    this.selectedPara = para;
  }

  selectPara2(para): void {
    if (this.selectedPara === para) {
      this.selectedPara = null;
      return;
    }
    this.selectedPara = para;
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
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
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
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
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

  insertBefore(para) {
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
    this.insertPos = this.chap.paras.indexOf(para);
  }

  insertAfter(para) {
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
    let index = this.chap.paras.indexOf(para);
    this.insertPos = index + 1;
  }

  saveInsert(content: string) {
    if (!this.insertPos) {
      return;
    }
    let target = this.chap.paras[this.insertPos];
    let model = {content} as Para;
    model.chapId = this.chap._id;
    let obs;
    if (this.insertPos < this.chap.paras.length) {
      obs = this.paraService.createBefore(target._id, model);
    } else {
      obs = this.paraService.create(model);
    }
    obs.subscribe(para => {
      if (!para._id) {
        alert('Fail');
        return;
      }
      this.chap.paras.splice(this.insertPos, 0, model);
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

  mergeUp(para): void {
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
    let paras = this.chap.paras;
    let index = paras.indexOf(para);
    if (index === 0) {
      return;
    }
    let targetPara = paras[index - 1];
    this.mergeContent(targetPara, para, targetPara);
    this.saveMerge(targetPara, para);
  }

  mergeDown(para): void {
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
    let paras = this.chap.paras;
    let index = paras.indexOf(para);
    if (index === paras.length - 1) {
      return;
    }
    let targetPara = paras[index + 1];
    this.mergeContent(para, targetPara, targetPara);
    this.saveMerge(targetPara, para);
  }

  paraTracker(index, para) {
    return para._id;
  }

}

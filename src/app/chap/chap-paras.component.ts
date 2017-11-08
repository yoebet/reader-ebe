import {Component, Input, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/switchMap';

import {Chap} from '../models/chap';
import {Para} from '../models/para';
import {ParaService} from '../services/para.service';
import {OpResult} from '../models/op-result';

import {ParaFormComponent} from './para-form.component';
import {Annotations} from '../content/annotations';

const LF = '\n';
const Splitter = /\n\n+/;

@Component({
  selector: 'chap-paras',
  templateUrl: './chap-paras.component.html',
  styleUrls: ['./chap-paras.component.css']
})
export class ChapParasComponent implements OnInit {
  @Input() chap: Chap;
  @ViewChild(ParaFormComponent)
  private paraFormComponent: ParaFormComponent;
  editingPara: Para;
  selectedPara: Para;
  insertPos: number;
  clickToEdit = false;
  continuousEditing = false;
  splitMode = false;
  annotating = true;
  annotateOnly = false;
  editInplace = false;
  groupedAnnotations = Annotations.grouped;
  annotationGroup = null;
  currentAnnotation = null;
  latestAnnotations = [];

  keepAgPopup = false;
  agPopupHiddenTimer = null;
  agPopupTimer = null;

  // {
  //   para: {},
  //   pullContent: fn
  // }
  contentChangedNotification = null;

  constructor(private paraService: ParaService) {
  }

  ngOnInit(): void {
    if (!this.chap.paras) {
      this.chap.paras = [];
    }
    let ag = this.groupedAnnotations[0];
    if (ag) {
      let size = Math.min(ag.annotations.length, 3);
      for (let i = 0; i < size; i++) {
        this.latestAnnotations.push(ag.annotations[i]);
      }
    }

  }

  selectPara(para): void {
    if (this.selectedPara === para) {
      return;
    }
    this.saveChangedContentIfAny();
    this.selectedPara = para;
    if (this.clickToEdit) {
      this.edit(para);
    }
  }

  selectPara2(para): void {
    if (this.selectedPara === para) {
      this.selectedPara = null;
      return;
    }
    this.selectPara(para);
  }

  clickAnnotationGroup(group) {
    this.keepAgPopup = !this.keepAgPopup;
    this.annotationGroup = group
  }

  selectAnnotationGroup(group) {
    this.annotationGroup = group;
    if (this.agPopupHiddenTimer) {
      clearInterval(this.agPopupHiddenTimer);
      this.agPopupHiddenTimer = null;
    }
  }

  agPopupMouseover(group) {
    if (this.agPopupHiddenTimer) {
      clearInterval(this.agPopupHiddenTimer);
      this.agPopupHiddenTimer = null;
    }
    if (this.annotationGroup !== null) {
      this.annotationGroup = group;
      return;
    }
    this.agPopupTimer = setTimeout(() => {
      this.annotationGroup = group;
    }, 500);
  }

  agPopupMouseout(group) {
    if (this.keepAgPopup) {
      return;
    }
    if (this.agPopupTimer) {
      clearInterval(this.agPopupTimer);
      this.agPopupTimer = null;
    }
    this.agPopupHiddenTimer = setTimeout(() => {
      if (this.annotationGroup === group) {
        this.annotationGroup = null;
      }
      this.agPopupHiddenTimer = null;
    }, 500);
  }

  switchAnnotation(annotation, $event): void {
    if (this.currentAnnotation === annotation) {
      this.currentAnnotation = null;
    } else {
      this.currentAnnotation = annotation;
      if (this.latestAnnotations.indexOf(annotation) === -1) {
        if (this.latestAnnotations.length >= 20) {
          this.latestAnnotations.shift();
        }
        this.latestAnnotations.push(annotation);
      }
    }
  }

  removeFromLatest(annotation, $event) {
    this.latestAnnotations = this.latestAnnotations.filter(a => a !== annotation);
    $event.preventDefault();
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
          console.error(opr.message || 'Fail');
          return;
        }
        this.chap.paras = this.chap.paras.filter(p => p !== para);
      });
  }

  edit(para: Para): void {
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
    this.editingPara = para;
  }

  append(): void {
    this.insertPos = this.chap.paras.length;
  }

  cancelEdit(): void {
    this.editingPara = null;
    this.insertPos = null;
  }

  private saveChangedContentIfAny() {
    if (!this.contentChangedNotification) {
      return;
    }
    let {para, pullContent} = this.contentChangedNotification;
    let changedContent = pullContent.call();
    if (changedContent === para.content) {
      return;
    }

    let toSave = Object.assign(new Para(), para);
    toSave.content = changedContent;
    this.save(toSave);
  }

  onContentChange(para, pullContent) {
    let ccn = this.contentChangedNotification;
    if (ccn && ccn.para._id !== para._id) {
      this.saveChangedContentIfAny();
    }
    this.contentChangedNotification = {para, pullContent};
  }

  onContentCommand(para, command) {
    let ccn = this.contentChangedNotification;
    if (ccn && ccn.para._id === para._id) {
      if (command === 'save') {
        this.saveChangedContentIfAny();
      }
      if (command === 'save' || command === 'discard') {
        this.contentChangedNotification = null;
      }
    }
  }

  insertBefore(para) {
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
    this.insertPos = this.chap.paras.indexOf(para);
  }

  // insertAfter(para) {
  //   para = para || this.selectedPara;
  //   if (!para) {
  //     return;
  //   }
  //   let index = this.chap.paras.indexOf(para);
  //   this.insertPos = index + 1;
  // }

  private splitIfNeeded(para): Para[] {
    if (!this.splitMode) {
      return null;
    }
    if (!Splitter.test(para.content) &&
      !Splitter.test(para.trans)) {
      return null;
    }

    let parasCreateAfter = [];
    let contents = para.content.split(Splitter);
    let transs = [];
    if (para.trans) {
      transs = para.trans.split(Splitter);
    }
    let size = Math.max(contents.length, transs.length);
    para.content = contents[0] || '';
    para.trans = transs[0] || '';
    for (let index = 1; index < size; index++) {
      let np = new Para();
      np.chapId = para.chapId;
      np.content = contents[index] || '';
      np.trans = transs[index] || '';
      parasCreateAfter.push(np);
    }

    return parasCreateAfter;
  }

  private update(para) {
    let parasCreateAfter = this.splitIfNeeded(para);
    if (parasCreateAfter) {
      this.paraService.createManyAfter(para, parasCreateAfter)
        .subscribe((paras: Para[]) => {
          let index = this.chap.paras.findIndex(p => p._id === para._id);
          this.chap.paras.splice(index + 1, 0, ...paras);
          this.doUpdate(para);
        });
    } else {
      this.doUpdate(para);
    }
  }

  private doUpdate(para) {
    this.paraService.update(para)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          console.error(opr.message || 'Fail');
          return;
        }
        let currentPara = this.chap.paras.find(p => p._id === para._id);
        Object.assign(currentPara, para);
        if (this.editingPara && para._id === this.editingPara._id) {
          this.editingPara = null;
        }
      });
  }

  save(para) {
    if (para._id) {
      this.update(para);
      return;
    }
    if (this.insertPos == null) {
      return;
    }
    para.chapId = this.chap._id;

    let paras = this.splitIfNeeded(para);

    if (paras) {
      paras.unshift(para);
      let obs;
      if (this.insertPos < this.chap.paras.length) {
        let target = this.chap.paras[this.insertPos];
        obs = this.paraService.createManyBefore(target._id, paras);
      } else {
        obs = this.paraService.createMany(paras);
      }
      obs.subscribe(ps => {
        this.chap.paras.splice(this.insertPos, 0, ...ps);

        if (this.continuousEditing) {
          this.paraFormComponent.clear();
          this.insertPos += ps.length;
        } else {
          this.insertPos = null;
        }
      });
      return;
    }

    let obs2;
    if (this.insertPos < this.chap.paras.length) {
      let target = this.chap.paras[this.insertPos];
      obs2 = this.paraService.createBefore(target._id, para);
    } else {
      obs2 = this.paraService.create(para);
    }
    obs2.subscribe(p => {
      if (!p._id) {
        console.error('Fail');
        return;
      }
      this.chap.paras.splice(this.insertPos, 0, p);

      if (this.continuousEditing) {
        this.paraFormComponent.clear();
        this.insertPos++;
      } else {
        this.insertPos = null;
      }
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
        console.error(opr.message || 'Fail To Save');
        return;
      }
    });
    this.paraService.remove(removePara._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          console.error(opr.message || 'Fail To Remove');
          return;
        }
        this.chap.paras = this.chap.paras.filter(p => p !== removePara);
        this.selectedPara = targetPara;
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

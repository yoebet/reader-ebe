import {Input, ViewChild} from '@angular/core';
import {SuiModalService} from 'ng2-semantic-ui';

import {ParaSetting} from '../config';
import {Book} from '../models/book';
import {Chap} from '../models/chap';
import {Para} from '../models/para';
import {OpResult} from '../models/op-result';
import {ChangeCallback, ChangeNotification, ContentFields} from '../content-types/change-notification';
import {ParaSaver} from '../content-types/para-saver';

import {ChapService} from '../services/chap.service';
import {ParaService} from '../services/para.service';
import {ParaFormComponent} from './para-form.component';
import {TransFillingContext, TransFilingModal} from './trans-filling.component';
import {SentenceAlignContext, SentenceAlignModal} from '../content/sentence-align.component';
import {ParaCommentsModal} from '../content/para-comments.component';
import {AppLink, AppLinkModal} from '../common/app-link.component';


export abstract class ParaEditingComponent {
  protected _book: Book;
  @Input() chap: Chap;
  @ViewChild(ParaFormComponent)
  protected paraFormComponent: ParaFormComponent;
  editingPara: Para;
  selectedPara: Para;
  insertPos: number;
  aligningSentence = false;
  clickToEdit = false;
  continuousEditing = false;
  splitMode = false;
  paraOperations = false;

  indentTrans = true;

  lastChanged: ChangeNotification = null;
  unsavedChanges: Map<string, ChangeNotification> = new Map();

  paraSaver: ParaSaver;


  protected constructor(protected chapService: ChapService,
                        protected paraService: ParaService,
                        public modalService: SuiModalService) {
  }

  protected checkCommentsCount() {
    if (!this.paraOperations) {
      return;
    }
    let chap = this.chap;
    if (chap && !chap.paraCommentsCountLoaded) {
      this.chapService.loadCommentsCount(chap)
        .subscribe(total => {
          console.log(`total comments: ${total}`);
        });
    }
  }

  protected doShowComments(para) {
    this.selectPara(para);
    this.modalService
      .open(new ParaCommentsModal(para));
  }

  showComments(para) {
    if (para.commentsCount === 0) {
      return;
    }
    if (para.comments) {
      this.doShowComments(para);
    } else {
      this.paraService.loadComments(para)
        .subscribe(cs => {
          this.doShowComments(para);
        });
    }
  }

  showLink(pn) {
    let chap = this.chap;
    let chapId = chap._id;
    let appLink = {path: `chaps/${chapId}?pn=${pn}`, title: chap.name, context: {chapId}} as AppLink;
    this.modalService.open(new AppLinkModal(appLink));
  }


  selectPara(para): void {
    if (this.selectedPara === para) {
      return;
    }
    this.saveChangedContent(this.lastChanged);
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

  protected stopEvent($event) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
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
          let message = opr.message || '不能删除';
          console.error(message);
          alert(message);
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
    this.insertPos = null;
    this.editingPara = para;
  }

  append(): void {
    this.insertPos = this.chap.paras.length;
  }

  cancelEdit(): void {
    this.editingPara = null;
    this.insertPos = null;
  }

  protected saveChangedContent(cn: ChangeNotification) {
    if (!cn) {
      return;
    }
    let {para, liveContent, onSaved} = cn;
    let toSave: ContentFields = liveContent();
    toSave._id = para._id;
    this.save(toSave, onSaved);
  }

  onContentChange(para, changeCallback: ChangeCallback) {
    let {liveContent, onSaved} = changeCallback;
    let thisChange = {para, liveContent, onSaved};
    let paraId = para._id;
    this.unsavedChanges.set(paraId, thisChange);
    let ccn = this.lastChanged;
    if (ccn && ccn.para._id !== paraId) {
      this.saveChangedContent(ccn);
    }
    this.lastChanged = thisChange;
  }

  onContentCommand(para, command) {
    let paraId = para._id;
    let ccn = this.lastChanged;
    if (ccn) {
      if (ccn.para._id === paraId) {
        if (command === 'save') {
          this.saveChangedContent(ccn);
        }
      }
      if (command === 'save' || command === 'discard') {
        this.lastChanged = null;
      }
    } else {
      ccn = this.unsavedChanges.get(paraId);
      if (ccn) {
        if (command === 'save') {
          this.saveChangedContent(ccn);
        } else if (command === 'discard') {
          this.unsavedChanges.delete(paraId);
        }
      }
    }
  }

  insertBefore(para) {
    para = para || this.selectedPara;
    if (!para) {
      return;
    }
    this.editingPara = null;
    this.insertPos = this.chap.paras.indexOf(para);
  }

  protected splitIfNeeded(para): Para[] {
    if (!this.splitMode) {
      return null;
    }
    let sp = ParaSetting.EmptyLineSplitter;
    if (!sp.test(para.content) && !sp.test(para.trans)) {
      return null;
    }

    let parasCreateAfter = [];
    let contents = para.content.trimRight().split(sp);
    let transs = [];
    if (para.trans) {
      transs = para.trans.trimRight().split(sp);
    }
    let size = Math.max(contents.length, transs.length);
    para.content = contents[0] || '';
    para.trans = transs[0] || '';
    for (let index = 1; index < size; index++) {
      let np = new Para();
      np.bookId = para.bookId;
      np.chapId = para.chapId;
      np.content = contents[index] || '';
      np.trans = transs[index] || '';
      parasCreateAfter.push(np);
    }

    return parasCreateAfter;
  }

  saveSplitPara(paras, onSaved = null) {
    let bookId = this._book._id;
    let chapId = this.chap._id;
    for (let p of paras) {
      p.bookId = bookId;
      p.chapId = chapId;
    }
    if (paras[0]._id) {
      let para = paras.shift();
      this.createManyAfterAndUpdate(para, paras, onSaved);
    } else {
      this.createMany(paras, onSaved);
    }
  }

  protected createManyAfterAndUpdate(para, newParas, onSaved = null) {
    this.ensureIndent(newParas);
    this.paraService.createManyAfter(para, newParas)
      .subscribe((paras: Para[]) => {
        let index = this.chap.paras.findIndex(p => p._id === para._id);
        this.chap.paras.splice(index + 1, 0, ...paras);
        this.doUpdate(para, onSaved);
      });
  }

  protected update(para, onSaved = null) {
    let parasCreateAfter = this.splitIfNeeded(para);
    if (parasCreateAfter) {
      this.createManyAfterAndUpdate(para, parasCreateAfter, onSaved);
    } else {
      this.doUpdate(para, onSaved);
    }
  }

  protected doUpdate(para, onSaved = null) {
    this.ensureIndent([para]);
    let paraId = para._id;
    //deep clone
    para = JSON.parse(JSON.stringify(para));
    let currentPara = this.chap.paras.find(p => p._id === paraId);

    let contentNotChanged = typeof para.content === 'undefined' || para.content === currentPara.content;
    let transNotChanged = typeof para.trans === 'undefined' || para.trans === currentPara.trans;
    if (contentNotChanged && transNotChanged) {
      if (this.editingPara && paraId === this.editingPara._id) {
        this.editingPara = null;
      }
      this.unsavedChanges.delete(paraId);
      if (onSaved) {
        onSaved();
      }
      return;
    }
    if (para.content === currentPara.content) {
      //needn't to transfer
      delete para.content;
    }
    if (para.trans === currentPara.trans) {
      delete para.trans;
    }
    this.paraService.update(para)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          let message = opr.message || '保存失败';
          console.error(message);
          alert(message);
          return;
        }
        Object.assign(currentPara, para);
        if (this.editingPara && paraId === this.editingPara._id) {
          this.editingPara = null;
        }

        this.unsavedChanges.delete(paraId);
        if (onSaved) {
          onSaved();
        }
      });
  }

  protected doUpdateParasTrans(chap, idTrans, onSaved = null) {

    this.chapService.updateParasTrans(chap._id, idTrans)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          let message = opr.message || '保存失败';
          console.error(message);
          alert(message);
          return;
        }

        let parasMap = new Map();
        for (let p of chap.paras) {
          parasMap.set(p._id, p);
        }

        for (let idt of idTrans) {
          let {_id, trans} = idt;
          let para = parasMap.get(_id);
          if (para) {
            para.trans = trans;
          }
        }

        if (onSaved) {
          onSaved();
        }
      });
  }

  patchTrans() {
    let context: TransFillingContext = {
      chap: this.chap,
      paraSaver: this.paraSaver,
      indentTrans: this.indentTrans
    };
    this.modalService
      .open(new TransFilingModal(context))
      .onApprove(p => {
      });
  }

  indentTransAll() {
    let chap = this.chap;
    if (!chap || !chap.paras) {
      return;
    }
    let paras = chap.paras;

    let idTrans = [];
    for (let para of paras) {
      let {_id, trans} = para;
      if (!trans) {
        continue;
      }
      let newTrans;
      if (trans.includes('<')) {
        if (trans.startsWith(ParaSetting.TransIndentStr + '<')) {
          continue;
        }
        newTrans = trans.replace(/>\s*/, '>' + ParaSetting.TransIndentStr);
      } else {
        newTrans = ParaSetting.TransIndentStr + trans.trim();
      }
      if (newTrans !== trans) {
        idTrans.push({_id, trans: newTrans});
      }
    }

    if (idTrans.length === 0) {
      alert('没有修改');
      return;
    }

    if (!confirm('影响 ' + idTrans.length + ' 个段落，要保存吗？')) {
      return;
    }

    this.doUpdateParasTrans(chap, idTrans);
  }

  protected ensureIndent(paras) {
    if (!this.indentTrans) {
      return;
    }
    for (let para of paras) {
      let trans = para.trans;
      if (!trans || trans.startsWith(ParaSetting.TransIndentStr)) {
        continue;
      }
      if (trans.includes('<')) {
        continue;
      }
      trans = trans.trim();
      trans = ParaSetting.TransIndentStr + trans;
      para.trans = trans;
    }
  }

  protected createMany(paras, onSaved = null) {
    this.ensureIndent(paras);
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

      if (onSaved) {
        onSaved();
      }
    });
  }

  save(para, onSaved = null) {
    if (para._id) {
      this.update(para, onSaved);
      return;
    }
    if (this.insertPos == null) {
      return;
    }
    para.bookId = this._book._id;
    para.chapId = this.chap._id;

    let paras = this.splitIfNeeded(para);

    if (paras) {
      paras.unshift(para);
      this.createMany(paras, onSaved);
      return;
    }

    this.ensureIndent([para]);
    let obs2;
    if (this.insertPos < this.chap.paras.length) {
      let target = this.chap.paras[this.insertPos];
      obs2 = this.paraService.createBefore(target._id, para);
    } else {
      obs2 = this.paraService.create(para);
    }
    obs2.subscribe(p => {
      if (!p._id) {
        let message = p.message || '保存失败';
        console.error(message);
        alert(message);
        return;
      }
      this.chap.paras.splice(this.insertPos, 0, p);

      if (this.continuousEditing) {
        this.paraFormComponent.clear();
        this.insertPos++;
      } else {
        this.insertPos = null;
      }

      if (onSaved) {
        onSaved();
      }
    });
  }

  protected mergeContent(p1, p2, target) {
    let {content: content1, trans: trans1} = p1;
    let {content: content2, trans: trans2} = p2;
    let content = content1 + '\n' + content2;
    let trans = trans1;
    if (trans1 || trans2) {
      if (!trans1) {
        trans = trans2;
      } else if (trans2) {
        trans = trans1 + '\n' + trans2;
      }
    }
    target.content = content;
    target.trans = trans;
  }

  protected saveMerge(targetPara, removePara) {
    this.paraService.update(targetPara).subscribe((opr: OpResult) => {
      if (opr.ok === 0) {
        let message = opr.message || '保存失败';
        console.error(message);
        alert(message);
        return;
      }
    });
    this.paraService.remove(removePara._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          let message = opr.message || '删除失败';
          console.error(message);
          alert(message);
          return;
        }
        this.chap.paras = this.chap.paras.filter(p => p !== removePara);
        this.selectedPara = targetPara;
      });
  }

  protected checkMerge() {
    let para = this.selectedPara;
    if (!para) {
      return null;
    }
    if (this.chap.status === 'R') {
      if (!confirm('本章内容已上线，确定要合并吗？')) {
        return null;
      }
    }
    return para;
  }

  mergeUp(): void {
    let para = this.checkMerge();
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

  mergeDown(): void {
    let para = this.checkMerge();
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


  alignSentences() {
    if (!this.selectedPara || this.editingPara) {
      return;
    }
    let selectedPara = JSON.parse(JSON.stringify(this.selectedPara));
    let context: SentenceAlignContext = {para: selectedPara, paraSaver: this.paraSaver};
    this.modalService
      .open(new SentenceAlignModal(context))
      .onDeny((d) => {
        this.aligningSentence = false;
      })
      .onApprove((para: Para) => {
        this.aligningSentence = false;
      });
    this.aligningSentence = true;
  }

  paraTracker(index, para) {
    return para._id;
  }

}

import {Component, Input, OnInit, ViewChild, HostListener} from '@angular/core';
import {SuiModalService} from 'ng2-semantic-ui';
import 'rxjs/add/operator/switchMap';
import Tether from 'tether';

import {UIConstants, DataAttrNames, DataAttrValues, LatestAnnotationsCount} from '../config';
import {Book} from '../models/book';
import {Chap} from '../models/chap';
import {Para} from '../models/para';
import {ParaService} from '../services/para.service';
import {OpResult} from '../models/op-result';

import {ParaFormComponent} from './para-form.component';
import {AnnotationSet} from '../anno/annotation-set';
import {ChangeCallback, ChangeNotification, ContentFields} from '../content-types/change-notification';
import {DictRequest, DictSelectedResult} from '../content-types/dict-request';
import {NoteRequest} from '../content-types/note-request';
import {AnnotationGroup} from '../models/annotation-group';
import {Annotation} from '../models/annotation';
import {SentenceAlignContext, SentenceAlignModal} from '../content/sentence-align.component';
import {AnnoFamilyService} from "../services/anno-family.service";
import {ParaSaver} from "../content-types/para-saver";
import {ContentContext} from "../content-types/content-context";


@Component({
  selector: 'chap-paras',
  templateUrl: './chap-paras.component.html',
  styleUrls: ['./chap-paras.component.css']
})
export class ChapParasComponent implements OnInit {
  private _book: Book;
  @Input() set book(book: Book) {
    this._book = book;
    if (!book) {
      return;
    }
    if (!this.contentContext) {
      this.contentContext = new ContentContext();
    }
    this.contentContext.contentLang = book.contentLang;
    this.contentContext.transLang = book.transLang;
    this.loadAnnotations();
  }

  get book(): Book {
    return this._book;
  }

  @Input() chap: Chap;
  @ViewChild(ParaFormComponent)
  private paraFormComponent: ParaFormComponent;
  editingPara: Para;
  selectedPara: Para;
  insertPos: number;
  showTrans = true;
  leftRight = true;
  clickToEdit = false;
  continuousEditing = false;
  splitMode = false;
  annotating = false;
  annotateOnly = false;
  editInplace = false;
  highlightSentence = true;
  annotatedWordsHover = true;

  annotationSet: AnnotationSet;
  contentContext: ContentContext;

  annotationGroup: AnnotationGroup = null;
  currentAnnotation: Annotation = null;
  latestAnnotations: Annotation[] = null;

  keepAgPopup = false;
  agPopupHiddenTimer = null;
  agPopupTimer = null;

  dictRequest: DictRequest = null;
  dictTether = null;

  noteRequest: NoteRequest = null;
  noteTether = null;
  noteRequestNote = '';

  lastChanged: ChangeNotification = null;
  unsavedChanges: Map<string, ChangeNotification> = new Map();

  paraSaver: ParaSaver;


  constructor(private paraService: ParaService,
              private annoService: AnnoFamilyService,
              public modalService: SuiModalService) {
  }

  ngOnInit(): void {
    if (!this.chap.paras) {
      this.chap.paras = [];
    }

    this.paraSaver = {
      save: this.save.bind(this),
      saveSplit: this.saveSplitPara.bind(this),
      cancelEdit: this.cancelEdit.bind(this)
    };
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent($event: KeyboardEvent) {
    if ($event.key === 'Escape') {
      if (this.currentAnnotation) {
        this.currentAnnotation = null;
        $event.stopPropagation();
      }
    }
  }

  private loadAnnotations() {
    let afId = this._book.annotationFamilyId;
    if (!afId) {
      return;
    }
    this.annoService.getAnnotationSet(afId)
      .subscribe((annotationSet: AnnotationSet) => {
        if (!annotationSet) {
          return;
        }
        this.annotationSet = annotationSet;
        this.contentContext.annotationSet = annotationSet;
        this.latestAnnotations = [];

        let ag: AnnotationGroup = annotationSet.groups[0];
        if (ag) {
          let size = Math.min(ag.annotations.length, 2);
          for (let i = 0; i < size; i++) {
            this.latestAnnotations.push(ag.annotations[i]);
          }
        }
        let phraG1 = annotationSet.findAnnotation(DataAttrNames.assoc, DataAttrValues.assocPhra1);
        if (phraG1) {
          this.latestAnnotations.push(phraG1);
        }

        this.annotating = true;
      });
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

  private stopEvent($event) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
  }

  clickAnnotationGroup(group, $event) {
    this.keepAgPopup = !this.keepAgPopup;
    this.annotationGroup = group;
    this.stopEvent($event);
  }

  selectAnnotationGroup(group) {
    this.annotationGroup = group;
    if (this.agPopupHiddenTimer) {
      clearTimeout(this.agPopupHiddenTimer);
      this.agPopupHiddenTimer = null;
    }
  }

  agPopupMouseover(group) {
    if (this.agPopupHiddenTimer) {
      clearTimeout(this.agPopupHiddenTimer);
      this.agPopupHiddenTimer = null;
    }
    if (this.annotationGroup !== null) {
      this.annotationGroup = group;
      return;
    }
    this.agPopupTimer = setTimeout(() => {
      this.annotationGroup = group;
    }, 300);
  }

  agPopupMouseout(group) {
    if (this.keepAgPopup) {
      return;
    }
    if (this.agPopupTimer) {
      clearTimeout(this.agPopupTimer);
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
        if (this.latestAnnotations.length >= LatestAnnotationsCount) {
          this.latestAnnotations.shift();
        }
        this.latestAnnotations.push(annotation);
      }
    }
    this.stopEvent($event);
  }

  removeFromLatest(annotation, $event) {
    this.latestAnnotations = this.latestAnnotations.filter(a => a !== annotation);
    this.stopEvent($event);
  }

  switchSpecialAnnotation(annotation, $event) {
    if (this.currentAnnotation === annotation) {
      this.currentAnnotation = null;
    } else {
      this.currentAnnotation = annotation;
    }
    this.stopEvent($event);
  }

  onAnnotatedWordsHoverChange() {
    let bodyClasses = document.body.classList;
    let className = 'drop-anno-disabled';
    if (this.annotatedWordsHover) {
      bodyClasses.remove(className);
    } else {
      bodyClasses.add(className);
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

  private saveChangedContent(cn: ChangeNotification) {
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
    let splitter = /\n\n+/;
    if (!splitter.test(para.content) &&
      !splitter.test(para.trans)) {
      return null;
    }

    let parasCreateAfter = [];
    let contents = para.content.split(splitter);
    let transs = [];
    if (para.trans) {
      transs = para.trans.split(splitter);
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
    let bookId = this.book._id;
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

  private createManyAfterAndUpdate(para, newParas, onSaved = null) {
    this.paraService.createManyAfter(para, newParas)
      .subscribe((paras: Para[]) => {
        let index = this.chap.paras.findIndex(p => p._id === para._id);
        this.chap.paras.splice(index + 1, 0, ...paras);
        this.doUpdate(para, onSaved);
      });
  }

  private update(para, onSaved = null) {
    let parasCreateAfter = this.splitIfNeeded(para);
    if (parasCreateAfter) {
      this.createManyAfterAndUpdate(para, parasCreateAfter, onSaved);
    } else {
      this.doUpdate(para, onSaved);
    }
  }

  private doUpdate(para, onSaved = null) {
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
      onSaved && onSaved();
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
          console.error(opr.message || 'Fail');
          return;
        }
        Object.assign(currentPara, para);
        if (this.editingPara && paraId === this.editingPara._id) {
          this.editingPara = null;
        }

        this.unsavedChanges.delete(paraId);
        onSaved && onSaved();
      });
  }

  private createMany(paras, onSaved = null) {
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

      onSaved && onSaved();
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
    para.bookId = this.book._id;
    para.chapId = this.chap._id;

    let paras = this.splitIfNeeded(para);

    if (paras) {
      paras.unshift(para);
      this.createMany(paras, onSaved);
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

      onSaved && onSaved();
    });
  }

  private mergeContent(p1, p2, target) {
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

  private removeTetherClass(el) {
    el.className = el.className.split(' ')
      .filter(n => !n.startsWith(UIConstants.tetherClassPrefixNoHyphen + '-')).join(' ');
    if (el.className === '') {
      el.removeAttribute('class');
    }
  }

  private closeDictPopup() {
    if (this.dictRequest) {
      if (this.dictTether) {
        this.dictTether.destroy();
        this.dictTether = null;
      }
      let el = this.dictRequest.wordElement;
      this.removeTetherClass(el);
      this.dictRequest = null;
    }
  }

  onDictRequest(dictRequest) {
    if (this.dictRequest) {
      if (this.dictRequest.wordElement === dictRequest.wordElement) {
        this.onDictItemSelect(null);
        return;
      } else {
        // cancel
        this.onDictItemSelect(null);
      }
    }
    this.dictRequest = dictRequest;
  }

  onDictPopupReady() {
    if (!this.dictRequest) {
      return;
    }
    if (this.dictTether) {
      this.dictTether.position();
    } else {
      let dictPopup = document.getElementById('dictPopup');
      this.dictTether = new Tether({
        element: dictPopup,
        target: this.dictRequest.wordElement,
        attachment: 'top center',
        targetAttachment: 'bottom center',
        constraints: [
          {
            to: 'window',
            attachment: 'together',
            pin: true
          }
        ],
        classPrefix: UIConstants.tetherClassPrefixNoHyphen
      });
    }
  }

  onDictItemSelect(selected: DictSelectedResult) {
    if (!this.dictRequest) {
      return;
    }
    let dr = this.dictRequest;
    this.closeDictPopup();
    dr.meaningItemCallback(selected);
  }

  private closeNotePopup() {
    if (this.noteRequest) {
      if (this.noteTether) {
        this.noteTether.destroy();
        this.noteTether = null;
      }
      let el = this.noteRequest.wordElement;
      this.removeTetherClass(el);
      this.noteRequest = null;
    }
    this.noteRequestNote = '';
  }

  onNoteRequest(noteRequest) {
    if (this.noteRequest) {
      // cancel
      this.completeNoteEdit(null);
    }
    this.noteRequest = noteRequest;
    this.noteRequestNote = noteRequest.note;

    let notePopup = document.getElementById('notePopup');
    this.noteTether = new Tether({
      element: notePopup,
      target: this.noteRequest.wordElement,
      attachment: 'top center',
      targetAttachment: 'bottom right',
      constraints: [
        {
          to: 'window',
          attachment: 'together',
          pin: true
        }
      ],
      classPrefix: UIConstants.tetherClassPrefixNoHyphen
    });
  }

  completeNoteEdit(note) {
    if (!this.noteRequest) {
      return;
    }
    let nr = this.noteRequest;
    this.closeNotePopup();
    nr.editNoteCallback(note);
  }

  alignSentences() {
    if (!this.selectedPara || this.editingPara) {
      return;
    }
    let selectedPara = JSON.parse(JSON.stringify(this.selectedPara));
    let context: SentenceAlignContext = {para: selectedPara, paraSaver: this.paraSaver};
    this.modalService
      .open(new SentenceAlignModal(context))
      // .onDeny((d) => {})
      .onApprove((para: Para) => {
        // this.save(para);
      });
  }

  paraTracker(index, para) {
    return para._id;
  }

}

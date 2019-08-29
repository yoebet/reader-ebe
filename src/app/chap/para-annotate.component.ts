import {
  Input, ViewChild, ViewContainerRef, ComponentFactory,
  ComponentFactoryResolver, ComponentRef
} from '@angular/core';
import {SuiModalService} from 'ng2-semantic-ui';

import * as Tether from 'tether';
import * as Drop from 'tether-drop';

import {
  DataAttrNames, DataAttrValues, LatestAnnotationsCount, UIConstants
} from '../config';
import {DictEntry} from '../models/dict-entry';
import {Annotation} from '../models/annotation';
import {AnnotationGroup} from '../models/annotation-group';
import {AnnotationSet} from '../anno/annotation-set';
import {AnnotatorHelper} from '../anno/annotator-helper';
import {DictRequest, MeaningRequest, SelectedItem} from '../content-types/dict-request';
import {NoteRequest} from '../content-types/note-request';
import {ContentContext} from '../content-types/content-context';

import {ParaService} from '../services/para.service';
import {AnnoFamilyService} from '../services/anno-family.service';
import {DictSimpleSmiComponent} from "../dict/dict-simple-smi.component";
import {ParaEditingComponent} from "./para-editing.component";
import {ChapService} from "../services/chap.service";


export abstract class ParaAnnotateComponent extends ParaEditingComponent {
  @ViewChild('dictSimple', {read: ViewContainerRef}) dictSimple: ViewContainerRef;

  annotating = false;
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

  simpleDictRequest: DictRequest = null;
  simpleDictDrop: Drop;
  simpleDictComponentRef: ComponentRef<DictSimpleSmiComponent>;

  noteRequest: NoteRequest = null;
  noteTether = null;
  noteRequestNote = '';

  meanRequest: MeaningRequest = null;
  meanTether = null;
  dictMean: SelectedItem = new SelectedItem();


  protected constructor(protected resolver: ComponentFactoryResolver,
                        protected chapService: ChapService,
                        protected paraService: ParaService,
                        protected annoService: AnnoFamilyService,
                        public modalService: SuiModalService) {
    super(chapService, paraService, modalService);
  }


  protected loadAnnotations() {
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

  protected toggleBodyClass(className: string, flag: boolean) {
    let bodyClasses = document.body.classList;
    if (flag) {
      bodyClasses.remove(className);
    } else {
      bodyClasses.add(className);
    }
  }

  onAnnotatedWordsHoverChange() {
    this.toggleBodyClass(UIConstants.annoDisabledBodyClass, this.annotatedWordsHover);
  }


  protected removeTetherClass(el) {
    el.className = el.className.split(' ')
      .filter(n => !n.startsWith(UIConstants.tetherClassPrefixNoHyphen + '-')).join(' ');
    if (el.className === '') {
      el.removeAttribute('class');
    }
  }

  protected closeDictPopup() {
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
    if (dictRequest && dictRequest.simplePopup) {
      this.showDictSimple(dictRequest);
    } else {
      this.dictRequest = dictRequest;
    }
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

  onDictItemSelect(selected: SelectedItem) {
    if (!this.dictRequest) {
      return;
    }
    let dr = this.dictRequest;
    this.closeDictPopup();
    dr.meaningItemCallback(selected);
  }

  protected closeNotePopup() {
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

  protected showDictSimple(dictRequest: DictRequest) {
    if (!dictRequest) {
      return;
    }
    if (this.simpleDictRequest) {
      let el = this.simpleDictRequest.wordElement;
      if (el === dictRequest.wordElement) {
        return;
      }
    }

    let {dictEntry, wordElement} = dictRequest;
    if (!this.simpleDictComponentRef) {
      let factory: ComponentFactory<DictSimpleSmiComponent> = this.resolver.resolveComponentFactory(DictSimpleSmiComponent);
      this.dictSimple.clear();
      this.simpleDictComponentRef = this.dictSimple.createComponent(factory);
    }
    let dscr = this.simpleDictComponentRef;

    let content = function () {
      dscr.instance.entry = dictEntry as DictEntry;
      return dscr.location.nativeElement;
    };

    setTimeout(() => {
      let lastDrop = this.simpleDictDrop;
      if (lastDrop) {
        lastDrop.close();
      }
      let drop = new Drop({
        target: wordElement,
        content: content,
        classes: `${UIConstants.dropClassPrefix}dict`,
        position: 'bottom center',
        constrainToScrollParent: false,
        remove: true,
        openOn: 'click'//click,hover,always
      });
      drop.open();
      drop.once('close', () => {
        AnnotatorHelper.removeDropTagIfDummy(wordElement);
        setTimeout(() => {
          drop.destroy();
        }, 10);
      });

      this.simpleDictRequest = dictRequest;
      this.simpleDictDrop = drop;
    }, 10);
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

  protected closeMeanPopup() {
    if (this.meanRequest) {
      if (this.meanTether) {
        this.meanTether.destroy();
        this.meanTether = null;
      }
      let el = this.meanRequest.wordElement;
      this.removeTetherClass(el);
      this.meanRequest = null;
      this.dictMean = new SelectedItem();
    }
  }

  onMeanRequest(request: MeaningRequest) {
    if (this.meanRequest) {
      if (this.meanRequest.wordElement === request.wordElement) {
        return;
      }
      this.completeMeanEdit();
    }
    this.meanRequest = request;
    this.dictMean = JSON.parse(JSON.stringify(request.initialSelected));

    let meanPopup = document.getElementById('meanPopup');
    this.meanTether = new Tether({
      element: meanPopup,
      target: this.meanRequest.wordElement,
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

  completeMeanEdit(op: 'set' | 'unset' | 'cancel' = 'set') {
    if (!this.meanRequest) {
      return;
    }
    let mr = this.meanRequest;
    let mean = this.dictMean;
    this.closeMeanPopup();
    if (op === 'cancel') {
      mr.meaningItemCallback(null);
    } else if (op === 'unset') {
      mr.meaningItemCallback({meaning: ''} as SelectedItem);
    } else {
      mr.meaningItemCallback(mean);
    }
  }

  onDictMeanWordKeyup($event) {
    if ($event.keyCode === 13) {
      $event.stopPropagation();
      this.requestDictInMeanEditing();
    }
  }

  requestDictInMeanEditing() {
    if (!this.meanRequest || !this.dictMean) {
      return;
    }
    this.dictMean.word = this.dictMean.word.trim();
    let callback = (selected: SelectedItem) => {
      if (!selected || !selected.meaning) {
        return;
      }
      if (selected.word) {
        this.dictMean.word = selected.word;
      }
      this.dictMean.pos = selected.pos;
      this.dictMean.meaning = selected.meaning;
    };
    let notFoundCallback = () => {
      alert('Not Found');
    };
    this.meanRequest.onRequestDict(this.dictMean.word, callback, notFoundCallback);
  }

}

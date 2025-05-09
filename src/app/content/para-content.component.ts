import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, ComponentFactory, ComponentRef
} from '@angular/core';

import * as Drop from 'tether-drop';

import {Annotator} from '../anno/annotator';
import {AnnotatorHelper} from '../anno/annotator-helper';
import {AnnotateResult} from '../anno/annotate-result';
import {AnnotationSet, HighlightGroups} from '../anno/annotation-set';

import {UIConstants, DataAttrNames, SpecialAnnotations} from '../config';
import {DictEntry, DictFields} from '../models/dict-entry';
import {DictZh} from '../models/dict-zh';
import {Annotation} from '../models/annotation';
import {Book} from '../models/book';

import {DictService} from '../services/dict.service';
import {DictZhService} from '../services/dict-zh.service';
import {ChangeCallback} from '../content-types/change-notification';
import {DictRequest, MeaningRequest, SelectedItem} from '../content-types/dict-request';
import {NoteRequest} from '../content-types/note-request';
import {WordAnnosComponent} from './word-annos.component';
import {ContentContext} from '../content-types/content-context';


declare type Side = 'content' | 'trans';

const SideContent: Side = 'content';
const SideTrans: Side = 'trans';

const TextWrapPart = false; // =editInplace

// declare type TriggerMethod = Tap/Click/LongClick/RightClick/Selection

@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html',
  styleUrls: ['./para-content.component.css']
})
export class ParaContentComponent implements OnChanges {
  @ViewChild('contentText', {read: ViewContainerRef}) contentText: ViewContainerRef;
  @ViewChild('transText', {read: ViewContainerRef}) transText: ViewContainerRef;
  @ViewChild('wordAnnos', {read: ViewContainerRef}) wordAnnos: ViewContainerRef;
  @Input() content: string;
  @Input() trans: string;
  @Input() showTrans: boolean;
  @Input() gotFocus: boolean;
  @Input() highlightSentence: boolean;
  @Input() annotatedWordsHover: boolean;
  @Input() annotating: boolean;
  @Input() annotation: Annotation;
  @Input() contentContext: ContentContext;
  @Output() contentChange = new EventEmitter<ChangeCallback>();
  @Output() contentCommand = new EventEmitter<string>();
  @Output() dictRequest = new EventEmitter<DictRequest>();
  @Output() noteRequest = new EventEmitter<NoteRequest>();
  @Output() meanRequest = new EventEmitter<MeaningRequest>();

  _contentAnnotator: Annotator;
  _transAnnotator: Annotator;
  beenChanged = false;
  contentChanged = false;
  transChanged = false;
  transRendered = false;
  sentenceHoverSetup = false;
  associatedWordsHoverSetup = false;
  annotatedWordsHoverSetup = false;
  highlightedSentences: Element[];
  highlightedWords: Element[];
  wordsPopupMap = new Map<Element, Drop>();
  wordAnnosComponentRef: ComponentRef<WordAnnosComponent>;

  contentSentenceMap: Map<string, Element>;
  transSentenceMap: Map<string, Element>;


  constructor(private resolver: ComponentFactoryResolver,
              private dictService: DictService,
              private dictZhService: DictZhService) {
  }


  get annotationSet(): AnnotationSet {
    if (!this.contentContext) {
      return AnnotationSet.emptySet();
    }
    return this.contentContext.annotationSet;
  }

  getTextLang(side: Side): string {
    let {contentLang, transLang} = this.contentContext;
    return (side === SideContent) ? (contentLang || Book.LangCodeEn) : (transLang || Book.LangCodeZh);
  }

  getAnnotator(side: Side, annotation = null): Annotator {
    let annt;
    if (side === SideContent) {
      annt = this._contentAnnotator;
      if (!annt) {
        let el = this.contentText.element.nativeElement;
        let lang = this.getTextLang(side);
        annt = new Annotator(el, lang);
        this._contentAnnotator = annt;
      }
    } else {
      annt = this._transAnnotator;
      if (!annt) {
        let el = this.transText.element.nativeElement;
        let lang = this.getTextLang(side);
        annt = new Annotator(el, lang);
        this._transAnnotator = annt;
      }
    }
    if (Book.isChineseText(annt.lang) && !annt.zhPhrases) {
      annt.zhPhrases = this.contentContext.zhPhrases;
    }
    annt.switchAnnotation(annotation || this.annotation);
    return annt;
  }

  private getTextEl(side: Side) {
    return side === SideContent ?
      this.contentText.element.nativeElement :
      this.transText.element.nativeElement;
  }

  private getTheSide(textEl): Side {
    return textEl === this.contentText.element.nativeElement ?
      SideContent :
      SideTrans;
  }

  private getTheOtherSideText(textEl) {
    return textEl === this.transText.element.nativeElement ?
      this.contentText.element.nativeElement :
      this.transText.element.nativeElement;
  }

  private destroyAnnotatedWordsPopup(element) {
    let drop: any = this.wordsPopupMap.get(element);
    if (drop) {
      drop.destroy();
      this.wordsPopupMap.delete(element);
    }
  }

  private trySetMeaning(side: Side, element, selected: SelectedItem) {

    if (!selected) {
      // cancel
      let {changed, removed} = AnnotatorHelper.removeDropTagIfDummy(element);
      if (changed) {
        // this.onContentChange();
        if (removed) {
          this.destroyAnnotatedWordsPopup(element);
        }
      }
      return;
    }

    let DataPos = DataAttrNames.pos;
    let DataMean = DataAttrNames.mean;
    let DataWord = DataAttrNames.word;
    let DataFPG = DataAttrNames.forPhraseGroup;

    if (!selected.meaning) {
      // unset
      delete element.dataset[DataPos];
      delete element.dataset[DataMean];
      delete element.dataset[DataWord];
      delete element.dataset[DataFPG];
      let {changed, removed} = AnnotatorHelper.removeDropTagIfDummy(element);
      if (removed) {
        this.destroyAnnotatedWordsPopup(element);
      }
    } else {
      if ((selected.pos || '') !== (element.dataset[DataPos] || '')) {
        element.dataset[DataPos] = selected.pos;
      }
      if (selected.meaning !== element.dataset[DataMean]) {
        element.dataset[DataMean] = selected.meaning;
      }
      if (selected.word !== element.dataset[DataWord]) {
        element.dataset[DataWord] = selected.word;
      }
      if (selected.forPhraseGroup !== element.dataset[DataFPG]) {
        element.dataset[DataFPG] = selected.forPhraseGroup;
      }
    }

    this.notifyChange(side);
    if (this.annotatedWordsHoverSetup) {
      let textEl = this.getTextEl(side);
      this.setupPopup(element, textEl);
    }
  }

  selectWordMeaning(side: Side, triggerMethod = null) {
    let ann = AnnotationSet.selectMeaningAnnotation;
    let ar: AnnotateResult = this.getAnnotator(side, ann).annotate();
    if (!ar || !ar.wordEl) {
      return;
    }
    let element = ar.wordEl as HTMLElement;

    this.doSelectWordMeaning(element, null, side, triggerMethod);
  }

  private doSelectWordMeaning(element: HTMLElement,
                              word: string,
                              side: Side,
                              triggerMethod = null,
                              callback: (selected: SelectedItem) => void = null,
                              notFoundCallback: () => void = null) {

    let oriForWord;
    if (word) {
      oriForWord = word;
    } else {
      word = element.textContent;
      oriForWord = element.dataset[DataAttrNames.word] || word;
    }

    let oriPos = element.dataset[DataAttrNames.pos] || '';
    let oriMeaning = element.dataset[DataAttrNames.mean];
    let forPhraseGroup = element.dataset[DataAttrNames.forPhraseGroup];

    let textEl = this.getTextEl(side);

    if (!callback) {
      callback = (selected: SelectedItem) => {
        if (selected) {
          selected.forPhraseGroup = forPhraseGroup;
        }
        this.trySetMeaning(side, element, selected);
      };
    }

    if (!notFoundCallback) {
      notFoundCallback = () => {
        if (triggerMethod === 'RightClick') {
          let mr = new MeaningRequest();
          mr.wordElement = element;
          mr.initialSelected = {word: oriForWord, pos: oriPos, meaning: oriMeaning, forPhraseGroup} as SelectedItem;
          mr.meaningItemCallback = callback;
          mr.onRequestDict = (word2: string,
                              cb: (selected: SelectedItem) => void,
                              notFoundCB: () => void) => {
            this.doSelectWordMeaning(element, word2, side, null, cb, notFoundCB);
          };
          this.meanRequest.emit(mr);
        } else {
          AnnotatorHelper.removeDropTagIfDummy(element);
        }
      };
    }

    let lang = this.getTextLang(side);
    if (!lang || lang === Book.LangCodeEn) {
      if (oriForWord.indexOf('­') >= 0) {// 173, 0xAD, soft hyphen
        oriForWord = oriForWord.replace(/­/, '');
      }
      let simplePopup = triggerMethod === 'Ctrl_Click';
      let options = {base: true, stem: true} as any;
      if (simplePopup) {
        options.fields = DictFields.SIMPLE;
      }
      this.dictService.getEntry(oriForWord, options)
        .subscribe((entry: DictEntry) => {
          if (entry == null) {
            notFoundCallback();
            return;
          }
          let dr = new DictRequest();
          dr.dictLang = 'en';
          dr.wordElement = element;
          dr.dictEntry = entry;
          dr.initialSelected = {pos: oriPos, meaning: oriMeaning} as SelectedItem;
          dr.relatedWords = null;
          dr.meaningItemCallback = callback;
          if (oriForWord !== word) {
            dr.relatedWords = [word];
          }
          let phrase = AnnotatorHelper.currentPhrase(element, textEl);
          if (phrase && phrase !== word && phrase !== oriForWord) {
            if (dr.relatedWords === null) {
              dr.relatedWords = [phrase];
            } else {
              dr.relatedWords.push(phrase);
            }
          }
          dr.simplePopup = simplePopup;
          this.dictRequest.emit(dr);
        });
    } else if (Book.isChineseText(lang)) {

      this.dictZhService.getEntry(oriForWord)
        .subscribe((entry: DictZh) => {
          if (entry == null) {
            notFoundCallback();
            return;
          }
          let dr = new DictRequest();
          dr.dictLang = 'zh';
          dr.wordElement = element;
          dr.dictEntry = entry;
          dr.initialSelected = {pos: oriPos, meaning: oriMeaning} as SelectedItem;
          dr.meaningItemCallback = callback;
          this.dictRequest.emit(dr);
        });
    }

  }

  addMeaning(side: Side) {
    let ann = AnnotationSet.editMeaningAnnotation;
    let ar: AnnotateResult = this.getAnnotator(side, ann).annotate();
    if (!ar || !ar.wordEl) {
      return;
    }
    let element = ar.wordEl as HTMLElement;

    this.doAddMeaning(element, side);
  }

  private doAddMeaning(element: HTMLElement, side: Side, forPhrase: { group: string, words: string } = null) {

    let word = element.textContent;
    if (forPhrase) {
      word = forPhrase.words;
    }

    let oriPos = element.dataset[DataAttrNames.pos];
    let oriMeaning = element.dataset[DataAttrNames.mean];
    let oriForWord = element.dataset[DataAttrNames.word] || word;

    let mr = new MeaningRequest();
    mr.wordElement = element;
    mr.initialSelected = {word: oriForWord, pos: oriPos, meaning: oriMeaning} as SelectedItem;
    if (forPhrase) {
      mr.initialSelected.forPhraseGroup = forPhrase.group;
    }
    mr.meaningItemCallback = (selected: SelectedItem) => {
      if (selected && forPhrase) {
        selected.forPhraseGroup = forPhrase.group;
      }
      this.trySetMeaning(side, element, selected);
    };
    mr.onRequestDict = (word2: string,
                        callback: (selected: SelectedItem) => void,
                        notFoundCallback: () => void) => {
      this.doSelectWordMeaning(element, word2, side, null, callback, notFoundCallback);
    };

    this.meanRequest.emit(mr);
  }

  addNote(side: Side, triggerMethod = null) {
    let ann = AnnotationSet.addNoteAnnotation;
    let ar: AnnotateResult = this.getAnnotator(side, ann).annotate();
    if (!ar || !ar.wordEl) {
      return;
    }
    let element = ar.wordEl as HTMLElement;
    this.doAddNote(element, side);
  }

  private doAddNote(element: HTMLElement, side: Side) {

    let dataName = DataAttrNames.note;
    let oriNote = element.dataset[dataName];

    let editNoteCallback = (note: string) => {
      let changed = false;
      if (note === null || note === oriNote) {
        // cancel
        AnnotatorHelper.removeDropTagIfDummy(element);
      } else {
        if (note === '') {
          // element.removeAttribute('data-note');
          delete element.dataset[dataName];
          let {removed} = AnnotatorHelper.removeDropTagIfDummy(element);
          if (removed) {
            this.destroyAnnotatedWordsPopup(element);
          }
        } else {
          element.dataset[dataName] = note;
          changed = true;
        }
      }
      if (changed) {
        this.notifyChange(side);
        if (this.annotatedWordsHoverSetup) {
          let textEl = this.getTextEl(side);
          this.setupPopup(element, textEl);
        }
      }
    };

    let nr = new NoteRequest();
    nr.wordElement = element;
    nr.note = oriNote || '';
    nr.editNoteCallback = editNoteCallback;
    this.noteRequest.emit(nr);
  }

  private doAnnotate(side: Side, triggerMethod = null) {
    if (this.annotation.nameEn === SpecialAnnotations.SelectMeaning.nameEn) {
      this.selectWordMeaning(side, triggerMethod);
      return;
    }
    if (this.annotation.nameEn === SpecialAnnotations.AddANote.nameEn) {
      this.addNote(side, triggerMethod);
      return;
    }
    if (this.annotation.nameEn === SpecialAnnotations.EditMeaning.nameEn) {
      this.addMeaning(side);
      return;
    }
    let ar: AnnotateResult = this.getAnnotator(side).annotate();
    if (!ar) {
      return;
    }
    if (ar.wordEl) {
      if (ar.elCreated) {
        let textEl = this.getTextEl(side);
        if (ar.wordEl.matches(HighlightGroups.HighlightSelectors)) {
          this.highlightAssociatedWords(ar.wordEl, textEl, this.getTheOtherSideText(textEl));
        }
        if (this.annotatedWordsHoverSetup) {
          this.setupPopup(ar.wordEl, textEl);
        }
      }
      if (ar.operation === 'remove') {
        let {changed, removed} = AnnotatorHelper.removeDropTagIfDummy(ar.wordEl);
        if (removed) {
          this.destroyAnnotatedWordsPopup(ar.wordEl);
        }
      }
      this.notifyChange(side);
    }
  }

  onMouseup($event, side: Side) {
    $event.stopPropagation();
    if ($event.which === 3) {
      return;
    }
    if (!this.gotFocus || !this.annotating) {
      return;
    }
    let triggerMethod = 'Click';
    if ($event.altKey) {
      triggerMethod = 'Alt_' + triggerMethod;
      this.addNote(side, triggerMethod);
      return;
    }
    if ($event.ctrlKey || $event.metaKey) {
      triggerMethod = 'Ctrl_' + triggerMethod;
      this.selectWordMeaning(side, triggerMethod);
      return;
    }
    if (!this.annotation) {
      return;
    }
    this.doAnnotate(side, triggerMethod);
  }

  onContextmenu($event, side: Side) {
    this.selectWordMeaning(side, 'RightClick');
    $event.stopPropagation();
    $event.preventDefault();
  }

  onKeyup($event, side: Side) {
    /*$event.stopPropagation();
    if (!this.editable) {
      return;
    }
    this.notifyChange(side);*/
  }

  private notifyChange(side: Side) {
    if (side === SideContent && this.contentChanged) {
      return;
    }
    if (side === SideTrans && this.transChanged) {
      return;
    }
    this.beenChanged = true;
    if (side === SideContent) {
      this.contentChanged = true;
    } else if (side === SideTrans) {
      this.transChanged = true;
    }
    let callback: ChangeCallback = {
      liveContent: this.getLiveContent.bind(this),
      onSaved: this.onParaSaved.bind(this)
    };
    this.contentChange.emit(callback);
  }

  private parseHtml(paraTextEl, side: Side) {
    paraTextEl = paraTextEl.cloneNode(true);

    if (side === SideContent) {
      let dcp = UIConstants.dropClassPrefix;
      let tcp = UIConstants.tetherClassPrefix;
      let dropEls = paraTextEl.querySelectorAll(`.${dcp}target, .${tcp}target`);
      for (let el of dropEls) {
        el.className = el.className.split(' ')
          .filter(n => !n.startsWith(dcp) && !n.startsWith(tcp)).join(' ');
        AnnotatorHelper.removeDropTagIfDummy(el);
      }
    }
    let hlEls = paraTextEl.querySelectorAll('.' + UIConstants.highlightClass);
    for (let hlEl of hlEls) {
      hlEl.classList.remove(UIConstants.highlightClass);
      AnnotatorHelper.removeDropTagIfDummy(hlEl);
    }
    let toStripEls = paraTextEl.querySelectorAll('br');
    for (let toStrip of toStripEls) {
      let pn = toStrip.parentNode;
      if (pn) {
        pn.removeChild(toStrip);
      }
    }
    let spanEls = paraTextEl.querySelectorAll('span');
    for (let spanEl of spanEls) {
      if (spanEl.hasAttribute('style')) {
        spanEl.removeAttribute('style');
        AnnotatorHelper.removeDropTagIfDummy(spanEl);
      }
    }
    let sentenceEls = paraTextEl.querySelectorAll(UIConstants.sentenceTagName);
    for (let sentenceEl of sentenceEls) {
      if (!sentenceEl.className) {
        sentenceEl.removeAttribute('class');
      }
    }

    if (!TextWrapPart) {
      return paraTextEl.innerHTML;
    }

    let textEls = paraTextEl.querySelectorAll('.para-text > .part');
    textEls = Array.from(textEls);
    if (textEls.length === 0) {
      return paraTextEl.innerHTML;
    }
    return textEls.map(el => el.innerHTML).join('\n');
  }


  getLiveContent() {
    let contents: any = {};
    if (this.contentChanged) {
      let contentEl = this.contentText.element.nativeElement;
      contents.content = this.parseHtml(contentEl, SideContent);
    }
    if (this.transChanged) {
      let transEl = this.transText.element.nativeElement;
      contents.trans = this.parseHtml(transEl, SideTrans);
    }
    return contents;
  }

  onParaSaved() {
    this.contentChanged = false;
    this.transChanged = false;
  }

  notifySave() {
    this.contentCommand.emit('save');
  }

  discard() {
    this.contentCommand.emit('discard');
    let changed = this.contentChanged || this.transChanged;
    if (this.contentChanged) {
      this.contentChanged = false;
      this.refreshContent();
    }
    if (this.transChanged) {
      this.transChanged = false;
      this.refreshTrans();
    }
    if (changed) {
      this.clearHovers();
      this.setupHovers();
    }
  }

  private clearSentenceHighlights() {
    let hls = this.highlightedSentences;
    if (!hls) {
      return;
    }
    while (hls.length > 0) {
      let hl = hls.pop();
      hl.classList.remove(UIConstants.highlightClass);
    }
    this.highlightedSentences = null;
  }

  private clearWordHighlights() {
    let hls = this.highlightedWords;
    if (!hls) {
      return;
    }
    while (hls.length > 0) {
      let hl = hls.pop();
      hl.classList.remove(UIConstants.highlightClass);
    }
    this.highlightedWords = null;
  }

  private setupSentenceIdMap() {
    if (this.contentSentenceMap != null) {
      return;
    }
    this.contentSentenceMap = new Map<string, Element>();
    this.transSentenceMap = new Map<string, Element>();
    let contentEl = this.contentText.element.nativeElement;
    let transEl = this.transText.element.nativeElement;
    for (let [textEl, selMap] of [[contentEl, this.contentSentenceMap], [transEl, this.transSentenceMap]]) {
      let sentenceEls = textEl.querySelectorAll(UIConstants.sentenceTagName);
      for (let stEl of sentenceEls) {
        if (!stEl.dataset) {
          continue;
        }
        let sid = stEl.dataset[UIConstants.sentenceIdAttrName];
        if (sid) {
          selMap.set(sid, stEl);
        }
      }
    }
  }

  private setupSentenceHover() {

    if (this.sentenceHoverSetup || !this.highlightSentence || !this.gotFocus) {
      return;
    }

    this.setupSentenceIdMap();

    let component = this;

    let sentenceMouseover = function (event) {
      if (!component.highlightSentence || !component.gotFocus) {
        return;
      }
      let el = this;
      if (!el.dataset) {
        return;
      }
      let sid = el.dataset[UIConstants.sentenceIdAttrName];
      if (!sid) {
        return;
      }

      component.clearSentenceHighlights();
      for (let selMap of [component.contentSentenceMap, component.transSentenceMap]) {
        let tsEl = selMap.get(sid);
        if (tsEl) {
          tsEl.classList.add(UIConstants.highlightClass);
          if (!component.highlightedSentences) {
            component.highlightedSentences = [];
          }
          component.highlightedSentences.push(tsEl);
        }
      }
    };

    let contentEl = this.contentText.element.nativeElement;
    let transEl = this.transText.element.nativeElement;
    for (let textEl of [contentEl, transEl]) {
      let sentenceEls = textEl.querySelectorAll(UIConstants.sentenceTagName);
      for (let sentenceEl of sentenceEls) {
        sentenceEl.addEventListener('mouseover', sentenceMouseover);
      }
    }

    this.sentenceHoverSetup = true;
  }

  private highlightAssociatedWords(wordEl, textEl, theOtherTextEl) {

    let theOtherSentenceMap = (textEl === this.contentText.element.nativeElement) ?
      this.transSentenceMap : this.contentSentenceMap;

    let component = this;

    let wordsMouseleave = function (event) {
      component.clearWordHighlights();
    };

    let wordsMouseover = function (event) {
      component.clearWordHighlights();

      let el = this;
      let stEl = AnnotatorHelper.findSentence(el, textEl);
      let stEl2;
      if (stEl) {
        if (stEl.dataset) {
          let sid = stEl.dataset[UIConstants.sentenceIdAttrName];
          stEl2 = theOtherSentenceMap.get(sid);
        }
      } else {
        stEl = textEl;
        stEl2 = theOtherTextEl;
      }

      let groupSelector = HighlightGroups.matchGroup(el);
      if (!groupSelector) {
        return;
      }
      if (!component.highlightedWords) {
        component.highlightedWords = [];
      }

      let annEls = stEl.querySelectorAll(groupSelector);
      for (let annEl of annEls) {
        annEl.classList.add(UIConstants.highlightClass);
        component.highlightedWords.push(annEl);
      }
      if (stEl2) {
        let annEls2 = stEl2.querySelectorAll(groupSelector);
        for (let annEl of annEls2) {
          annEl.classList.add(UIConstants.highlightClass);
          component.highlightedWords.push(annEl);
        }
      }
    };

    wordEl.addEventListener('mouseover', wordsMouseover);
    wordEl.addEventListener('mouseleave', wordsMouseleave);
  }

  private setupAssociationHover() {

    if (this.associatedWordsHoverSetup || !this.gotFocus) {
      return;
    }

    this.setupSentenceIdMap();

    let contentEl = this.contentText.element.nativeElement;
    let transEl = this.transText.element.nativeElement;

    let selector = HighlightGroups.HighlightSelectors;

    let annEls = contentEl.querySelectorAll(selector);
    for (let annEl of annEls) {
      this.highlightAssociatedWords(annEl, contentEl, transEl);
    }

    let tAnnEls = transEl.querySelectorAll(selector);
    for (let annEl of tAnnEls) {
      this.highlightAssociatedWords(annEl, transEl, contentEl);
    }

    this.associatedWordsHoverSetup = true;
  }


  private setupPopup(wordEl, textEl) {
    if (this.wordsPopupMap.has(wordEl)) {
      return;
    }

    if (!this.wordAnnosComponentRef) {
      let factory: ComponentFactory<WordAnnosComponent> = this.resolver.resolveComponentFactory(WordAnnosComponent);
      this.wordAnnos.clear();
      this.wordAnnosComponentRef = this.wordAnnos.createComponent(factory);
    }
    let wacr = this.wordAnnosComponentRef;
    wacr.instance.onTagRemoved = this.destroyAnnotatedWordsPopup.bind(this);

    let side = this.getTheSide(textEl);
    let notifyChange = () => {
      this.notifyChange(side);
    };
    let onEditNote = (el: HTMLElement) => {
      this.doAddNote(el, side);
    };
    let onEditMeaning = (el: HTMLElement, forPhrase: { group: string, words: string } = null) => {
      this.doAddMeaning(el, side, forPhrase);
    };

    let component = this;

    let content = function () {
      wacr.instance.paraTextEl = textEl;
      wacr.instance.annotationSet = component.annotationSet;
      wacr.instance.enabled = component.annotatedWordsHover;
      wacr.instance.notifyChange = notifyChange;
      wacr.instance.onEditNote = onEditNote;
      wacr.instance.onEditMeaning = onEditMeaning;
      wacr.instance.wordEl = wordEl;
      return wacr.location.nativeElement;
    };
    let drop = new Drop({
      target: wordEl,
      content: content,
      classes: `${UIConstants.dropClassPrefix}anno`,
      position: 'bottom center',
      constrainToScrollParent: false,
      remove: true,
      hoverOpenDelay: 100,
      openOn: 'hover'//click,hover,always
    });

    this.wordsPopupMap.set(wordEl, drop);
  }


  private setupAnnotationsPopup() {

    if (this.annotatedWordsHoverSetup || !this.annotatedWordsHover || !this.gotFocus) {
      return;
    }

    this.wordsPopupMap.clear();

    let contentEl = this.contentText.element.nativeElement;
    let annEls = contentEl.querySelectorAll(UIConstants.annotationTagName);
    for (let annEl of annEls) {
      this.setupPopup(annEl, contentEl);
    }

    let transEl = this.transText.element.nativeElement;
    let tAnnEls = transEl.querySelectorAll(UIConstants.annotationTagName);
    for (let annEl of tAnnEls) {
      this.setupPopup(annEl, transEl);
    }

    this.annotatedWordsHoverSetup = true;
  }

  refreshContent() {
    let html = this.content || ' ';
    if (TextWrapPart) {
      html = `<div class="part">${html}</div>`;
    }
    this.contentText.element.nativeElement.innerHTML = html;
  }

  refreshTrans() {
    let html = this.trans || ' ';
    if (TextWrapPart) {
      html = `<div class="part">${html}</div>`;
    }
    this.transText.element.nativeElement.innerHTML = html;
    this.transRendered = true;
  }

  private clearHovers() {
    this.contentSentenceMap = null;
    this.sentenceHoverSetup = false;
    this.associatedWordsHoverSetup = false;
    this.annotatedWordsHoverSetup = false;
  }

  private setupHovers() {
    this.setupSentenceHover();
    this.setupAssociationHover();
    this.setupAnnotationsPopup();
  }

  private annotateCurrentCursor(side: Side) {
    let annotator = this.getAnnotator(side);
    let wacins = annotator.wordAtCursorIfNoSelection;
    annotator.wordAtCursorIfNoSelection = false;
    this.doAnnotate(side, 'Selection');
    annotator.wordAtCursorIfNoSelection = wacins;
  }

  ngOnChanges(changes: SimpleChanges) {
    let textChanged = false;
    if (changes.trans) {
      this.transRendered = false;
    }
    if (this.showTrans && !this.transRendered) {
      this.refreshTrans();
      textChanged = true;
    }
    if (changes.content) {
      this.refreshContent();
      textChanged = true;
    }
    if (!textChanged && changes.annotation) {
      if (this.gotFocus && this.annotating && this.annotation) {
        let contentEl = this.contentText.element.nativeElement;
        let transEl = this.transText.element.nativeElement;
        let selection = window.getSelection();
        let selected = AnnotatorHelper.checkSelectionContainer(selection, contentEl, transEl);
        if (selected) {
          if (selected === contentEl) {
            this.annotateCurrentCursor(SideContent);
          } else {
            this.annotateCurrentCursor(SideTrans);
          }
        }
      }
    }

    if (this.highlightedSentences && (!this.gotFocus || !this.sentenceHoverSetup || !this.highlightSentence)) {
      this.clearSentenceHighlights();
    }
    if (this.highlightedWords && (!this.gotFocus || changes.content || changes.trans)) {
      this.clearWordHighlights();
    }

    if (textChanged) {
      this.clearHovers();
    }
    if (this.gotFocus) {
      this.setupHovers();
    }
  }
}

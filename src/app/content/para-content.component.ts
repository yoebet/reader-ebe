import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, ComponentFactory, ComponentRef
} from '@angular/core';

import Drop from 'tether-drop'

import {Annotator} from '../anno/annotator';
import {AnnotatorHelper} from "../anno/annotator-helper";
import {AnnotateResult} from '../anno/annotate-result'
import {HighlightGroups} from '../anno/annotation-set';

import {UIConstants, DataAttrNames, SpecialAnnotations} from '../config';
import {DictEntry} from '../models/dict-entry';
import {DictZh} from '../models/dict-zh';
import {Annotation} from '../models/annotation';
import {Book} from '../models/book';

import {DictService} from '../services/dict.service';
import {DictZhService} from '../services/dict-zh.service';
import {ChangeCallback} from '../content-types/change-notification';
import {DictRequest, DictSelectedResult, SelectedItem} from '../content-types/dict-request';
import {NoteRequest} from '../content-types/note-request';
import {WordAnnosComponent} from './word-annos.component'
import {ContentContext} from "../content-types/content-context";


declare type Side = 'content' | 'trans';

const SideContent: Side = 'content';
const SideTrans: Side = 'trans';

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
  @Input() editable: boolean;
  @Input() highlightSentence: boolean;
  @Input() annotatedWordsHover: boolean;
  @Input() annotating: boolean;
  @Input() annotation: Annotation;
  @Input() contentContext: ContentContext;
  @Output() contentChange = new EventEmitter<ChangeCallback>();
  @Output() contentCommand = new EventEmitter<string>();
  @Output() dictRequest = new EventEmitter<DictRequest>();
  @Output() noteRequest = new EventEmitter<NoteRequest>();

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

  static highlightWordsSelector = HighlightGroups.highlightAnnotationSelectors;


  constructor(private resolver: ComponentFactoryResolver,
              private dictService: DictService,
              private dictZhService: DictZhService) {
  }


  get annotationSet() {
    return this.contentContext.annotationSet;
  }

  getTextLang(side: Side) {
    let {contentLang, transLang} = this.contentContext;
    return (side === SideContent) ? (contentLang || Book.LangCodeEn) : (transLang || Book.LangCodeZh);
  }

  getAnnotator(side: Side, annotation = null) {
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

  private getTheOtherSide(textEl) {
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

  private removeTagIfDummy(el) {
    let result = {changed: false, removed: false};
    if (el.tagName !== UIConstants.annotationTagName.toUpperCase() && el.tagName !== 'SPAN') {
      return result;
    }
    if (el.className === '') {
      el.removeAttribute('class');
      result.changed = true;
    } else if (el.attributes.length === 1 && el.hasAttributes('class')) {
      let cns = el.className.split(' ')
        .filter(n => !n.startsWith(UIConstants.dropClassPrefix)
          && !n.startsWith(UIConstants.tetherClassPrefix)
          && n !== UIConstants.highlightClass);
      if (cns.length === 0) {
        el.removeAttribute('class');
        result.changed = true;
      }
    }
    if (!el.hasAttributes()) {
      //remove tag
      let pp = el.parentNode;
      if (!pp) {
        return result;
      }
      while (el.firstChild) {
        pp.insertBefore(el.firstChild, el);
      }
      pp.removeChild(el);
      pp.normalize();
      result.changed = true;
      result.removed = true;
    }
    return result;
  }

  selectWordMeaning(side: Side) {
    let ann = this.annotationSet.selectMeaningAnnotation;
    let ar: AnnotateResult = this.getAnnotator(side, ann).annotate();
    if (!ar || !ar.wordEl) {
      return;
    }
    let element: any = ar.wordEl;
    let word = element.textContent;

    let oriPos = element.dataset[DataAttrNames.pos];
    let oriMeaning = element.dataset[DataAttrNames.mean];
    let oriForWord = element.dataset[DataAttrNames.word] || word;

    let textEl = this.getTextEl(side);

    let meaningItemCallback = (selected: DictSelectedResult) => {

      if (!selected) {
        // cancel
        let {changed, removed} = this.removeTagIfDummy(element);
        if (changed) {
          // this.onContentChange();
          if (removed) {
            this.destroyAnnotatedWordsPopup(element);
          }
        }
        return;
      }

      if (!selected.meaning) {
        // unset
        delete element.dataset[DataAttrNames.mid];
        delete element.dataset[DataAttrNames.pos];
        delete element.dataset[DataAttrNames.mean];
        delete element.dataset[DataAttrNames.word];
        let {changed, removed} = this.removeTagIfDummy(element);
        if (removed) {
          this.destroyAnnotatedWordsPopup(element);
        }
      } else {
        if (selected.pos !== oriPos) {
          element.dataset[DataAttrNames.pos] = selected.pos || '';
        }
        if (selected.meaning !== oriMeaning) {
          element.dataset[DataAttrNames.mean] = selected.meaning;
        }
        if (selected.word && selected.word !== oriForWord) {
          element.dataset[DataAttrNames.word] = selected.word;
        }
      }

      this.notifyChange(side);
      if (this.annotatedWordsHoverSetup) {
        this.showAnnotationsHover(element, textEl);
      }
    };

    let lang = this.getTextLang(side);
    if (!lang || lang === Book.LangCodeEn) {

      this.dictService.getEntry(oriForWord, {base: true, stem: true})
        .subscribe((entry: DictEntry) => {
          if (entry == null) {
            this.removeTagIfDummy(element);
            return;
          }
          let dr = new DictRequest();
          dr.dictLang = 'en';
          dr.wordElement = element;
          dr.dictEntry = entry;
          dr.initialSelected = {pos: oriPos, meaning: oriMeaning} as SelectedItem;
          dr.relatedWords = null;
          dr.meaningItemCallback = meaningItemCallback;
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
          this.dictRequest.emit(dr);
        });
    } else if (Book.isChineseText(lang)) {

      this.dictZhService.getEntry(oriForWord)
        .subscribe((entry: DictZh) => {
          if (entry == null) {
            this.removeTagIfDummy(element);
            return;
          }
          let dr = new DictRequest();
          dr.dictLang = 'zh';
          dr.wordElement = element;
          dr.dictEntry = entry;
          dr.initialSelected = {pos: oriPos, meaning: oriMeaning} as SelectedItem;
          dr.meaningItemCallback = meaningItemCallback;
          this.dictRequest.emit(dr);
        });
    }

  }

  addANote(side: Side) {
    let ann = this.annotationSet.addNoteAnnotation;
    let ar: AnnotateResult = this.getAnnotator(side, ann).annotate();
    if (!ar || !ar.wordEl) {
      return;
    }
    let dataName = DataAttrNames.note;
    let element: any = ar.wordEl;
    let oriNote = element.dataset[dataName];

    let editNoteCallback = (note: string) => {
      let changed = false;
      if (note === null || note === oriNote) {
        // cancel
        this.removeTagIfDummy(element);
      } else {
        if (note === '') {
          // element.removeAttribute('data-note');
          delete element.dataset[dataName];
          this.removeTagIfDummy(element);
          if (typeof oriNote !== 'undefined') {
            changed = true;
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
          this.showAnnotationsHover(element, textEl);
        }
      }
    };

    let nr = new NoteRequest();
    nr.wordElement = element;
    nr.note = oriNote || '';
    nr.editNoteCallback = editNoteCallback;
    this.noteRequest.emit(nr)
  }

  private doAnnotate(side: Side) {
    if (this.annotation.nameEn === SpecialAnnotations.SelectMeaning.nameEn) {
      this.selectWordMeaning(side);
      return;
    }
    if (this.annotation.nameEn === SpecialAnnotations.AddANote.nameEn) {
      this.addANote(side);
      return;
    }
    let ar: AnnotateResult = this.getAnnotator(side).annotate();
    if (!ar) {
      return;
    }
    if (ar.wordEl) {
      if (ar.elCreated) {
        let textEl = this.getTextEl(side);
        if (ar.wordEl.matches(ParaContentComponent.highlightWordsSelector)) {
          this.highlightAssociatedWords(ar.wordEl, textEl, this.getTheOtherSide(textEl));
        }
        if (this.annotatedWordsHoverSetup) {
          this.showAnnotationsHover(ar.wordEl, textEl);
        }
      }
      if (ar.operation === 'remove') {
        let {changed, removed} = this.removeTagIfDummy(ar.wordEl);
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
    if ($event.ctrlKey || $event.metaKey) {
      this.addANote(side);
      return;
    }
    if (!this.annotation) {
      return;
    }
    this.doAnnotate(side);
  }

  onContextmenu($event, side: Side) {
    this.selectWordMeaning(side);
    $event.stopPropagation();
    $event.preventDefault();
  }

  onKeyup($event, side: Side) {
    $event.stopPropagation();
    if (!this.editable) {
      return;
    }
    this.notifyChange(side);
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
        this.removeTagIfDummy(el);
      }
    }
    let hlEls = paraTextEl.querySelectorAll('.' + UIConstants.highlightClass);
    for (let hlEl of hlEls) {
      hlEl.classList.remove(UIConstants.highlightClass);
      this.removeTagIfDummy(hlEl);
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
        this.removeTagIfDummy(spanEl);
      }
    }
    let sentenceEls = paraTextEl.querySelectorAll(UIConstants.sentenceTagName);
    for (let sentenceEl of sentenceEls) {
      if (!sentenceEl.className) {
        sentenceEl.removeAttribute('class');
      }
    }

    let textEls = paraTextEl.querySelectorAll('.para-text > .part');
    textEls = Array.from(textEls);
    if (textEls.length === 0) {
      textEls = [paraTextEl];
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
    if (this.contentChanged) {
      this.contentChanged = false;
      this.refreshContent();
    }
    if (this.transChanged) {
      this.transChanged = false;
      this.refreshTrans();
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
      let annEls2 = stEl2.querySelectorAll(groupSelector);
      for (let annEl of annEls2) {
        annEl.classList.add(UIConstants.highlightClass);
        component.highlightedWords.push(annEl);
      }
    };

    wordEl.addEventListener('mouseover', wordsMouseover);
    wordEl.addEventListener('mouseleave', wordsMouseleave);
  }

  private setupAssociatedWordsHover() {

    if (this.associatedWordsHoverSetup || !this.gotFocus) {
      return;
    }

    this.setupSentenceIdMap();

    let contentEl = this.contentText.element.nativeElement;
    let transEl = this.transText.element.nativeElement;

    let annEls = contentEl.querySelectorAll(ParaContentComponent.highlightWordsSelector);
    for (let annEl of annEls) {
      this.highlightAssociatedWords(annEl, contentEl, transEl);
    }

    let tAnnEls = transEl.querySelectorAll(ParaContentComponent.highlightWordsSelector);
    for (let annEl of tAnnEls) {
      this.highlightAssociatedWords(annEl, transEl, contentEl);
    }

    this.associatedWordsHoverSetup = true;
  }


  private showAnnotationsHover(wordEl, textEl) {
    if (this.wordsPopupMap.has(wordEl)) {
      return;
    }

    if (!this.wordAnnosComponentRef) {
      let factory: ComponentFactory<WordAnnosComponent> = this.resolver.resolveComponentFactory(WordAnnosComponent);
      this.wordAnnos.clear();
      this.wordAnnosComponentRef = this.wordAnnos.createComponent(factory);
    }
    let wacr = this.wordAnnosComponentRef;
    wacr.instance.paraTextEl = textEl;
    let component = this;

    let content = function () {
      wacr.instance.enabled = component.annotatedWordsHover;
      wacr.instance.wordEl = wordEl;
      wacr.instance.annotationSet = component.annotationSet;
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


  private setupAnnotatedWordsHover() {

    if (this.annotatedWordsHoverSetup || !this.annotatedWordsHover || !this.gotFocus) {
      return;
    }

    this.wordsPopupMap.clear();

    let contentEl = this.contentText.element.nativeElement;
    let annEls = contentEl.querySelectorAll(UIConstants.annotationTagName);
    for (let annEl of annEls) {
      this.showAnnotationsHover(annEl, contentEl);
    }

    let transEl = this.transText.element.nativeElement;
    let tAnnEls = transEl.querySelectorAll(UIConstants.annotationTagName);
    for (let annEl of tAnnEls) {
      this.showAnnotationsHover(annEl, transEl);
    }

    this.annotatedWordsHoverSetup = true;
  }

  refreshContent() {
    let html = this.content || ' ';
    html = `<div class="part">${html}</div>`;
    this.contentText.element.nativeElement.innerHTML = html;
  }

  refreshTrans() {
    let html = this.trans || ' ';
    html = `<div class="part">${html}</div>`;
    this.transText.element.nativeElement.innerHTML = html;
    this.transRendered = true;
  }

  private annotateCurrentCursor(side: Side) {
    let annotator = this.getAnnotator(side);
    let wacins = annotator.wordAtCursorIfNoSelection;
    annotator.wordAtCursorIfNoSelection = false;
    this.doAnnotate(side);
    annotator.wordAtCursorIfNoSelection = wacins;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.trans) {
      this.transRendered = false;
    }
    if (this.showTrans && !this.transRendered) {
      this.refreshTrans();
      this.sentenceHoverSetup = false;
    }
    if (changes.content) {
      this.refreshContent();
      this.sentenceHoverSetup = false;
      this.associatedWordsHoverSetup = false;
      this.annotatedWordsHoverSetup = false;
    } else if (changes.annotation) {
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
    if (this.highlightedWords && (!this.gotFocus || changes.content)) {
      this.clearWordHighlights();
    }

    if (this.gotFocus) {
      this.setupSentenceHover();
      this.setupAssociatedWordsHover();
      this.setupAnnotatedWordsHover();
    }
  }
}

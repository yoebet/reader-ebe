import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, ComponentFactory, ComponentRef
} from '@angular/core';

import Drop from 'tether-drop'

import {Annotator} from '../anno/annotator';
import {AnnotateResult} from '../anno/annotate-result'
import {HighlightGroups} from '../anno/annotation-set';

import {DictEntry} from '../models/dict-entry';
import {Annotation} from '../models/annotation';
import {AnnotationSet} from '../anno/annotation-set';

import {DictService} from '../services/dict.service';
import {ParaLiveContent} from '../chap-types/para-live-content';
import {DictRequest} from '../chap-types/dict-request';
import {NoteRequest} from '../chap-types/note-request';
import {WordAnnosComponent} from './word-annos.component'

@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html',
  styleUrls: ['./para-content.component.css']
})
export class ParaContentComponent implements OnChanges {
  @ViewChild('contentText', {read: ViewContainerRef}) contentText: ViewContainerRef;
  @ViewChild('paraTrans', {read: ViewContainerRef}) paraTrans: ViewContainerRef;
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
  @Input() annotationSet: AnnotationSet;
  @Output() contentChange = new EventEmitter<ParaLiveContent>();
  @Output() contentCommand = new EventEmitter<string>();
  @Output() dictRequest = new EventEmitter<DictRequest>();
  @Output() noteRequest = new EventEmitter<NoteRequest>();
  _annotator: Annotator;
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

  static sentenceTagName = 's-st';
  static highlightClass = 'highlight';
  static dropClassPrefix = 'drop-';
  static tetherClassPrefix = 'dp-';
  static highlightWordsSelector = HighlightGroups.highlightAnnotationSelectors;

  constructor(private resolver: ComponentFactoryResolver,
              private dictService: DictService) {
  }

  get annotator() {
    if (!this._annotator) {
      let contentEl = this.contentText.element.nativeElement;
      this._annotator = new Annotator(contentEl);
    }
    this._annotator.switchAnnotation(this.annotation);
    return this._annotator;
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
    if (el.tagName !== Annotator.annotationTagName.toUpperCase() && el.tagName !== 'SPAN') {
      return result;
    }
    if (el.className === '') {
      el.removeAttribute('class');
      result.changed = true;
    } else if (el.attributes.length === 1 && el.hasAttributes('class')) {
      let cns = el.className.split(' ')
        .filter(n => !n.startsWith(ParaContentComponent.dropClassPrefix)
          && n !== ParaContentComponent.tetherClassPrefix
          && n !== ParaContentComponent.highlightClass);
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

  private currentPhrase(wordEl) {
    let stEl = this.findSentence(wordEl);
    if (!stEl) {
      stEl = this.contentText.element.nativeElement;
    }
    let ds = wordEl.dataset;
    let group = ds.phra;
    if (!group) {
      return null;
    }
    if (!/^g\d$/.test(group)) {
      return null;
    }
    let groupSelector = `[data-phra=${group}]`;
    let groupEls = stEl.querySelectorAll(groupSelector);
    let els = Array.from(groupEls);
    return els.map((el: Element) => el.textContent).join(' ');
  }

  selectWordMeaning() {
    let ar: AnnotateResult = this.annotator.annotate();
    if (!ar || !ar.wordEl) {
      return;
    }
    let element: any = ar.wordEl;
    let word = element.textContent;

    let oriMid = null;
    let dataName = this.annotation.dataName;//mid
    if (element.dataset[dataName]) {
      let mid = parseInt(element.dataset[dataName]);
      if (!isNaN(mid)) {
        oriMid = mid;
      }
    }
    let oriForWord = element.dataset.word || word;

    let meaningItemCallback = (selected: { word: string, selectedItemId: number }) => {
      let mid;
      let forWord;
      if (selected) {
        mid = selected.selectedItemId;
        forWord = selected.word;
      } else {
        mid = null;
        forWord = null;
      }
      if (mid == null) {
        // cancel
        let {changed, removed} = this.removeTagIfDummy(element);
        if (changed) {
          // this.onContentChange();
          if (removed) {
            this.destroyAnnotatedWordsPopup(element);
          }
        }
      } else {
        if (mid === -1) {
          //unset
          // element.removeAttribute('data-mid');
          delete element.dataset[dataName];
          if (element.dataset.word) {
            element.removeAttribute('data-word');
          }
          let {changed, removed} = this.removeTagIfDummy(element);
          if (removed) {
            this.destroyAnnotatedWordsPopup(element);
          }
        } else {
          element.dataset[dataName] = '' + mid;
          if (forWord !== oriForWord) {
            element.dataset.word = forWord;
          }
        }
        this.onContentChange();
        if (this.annotatedWordsHoverSetup) {
          this.showAnnotationsHover(element);
        }
      }
    };

    this.dictService.getEntry(oriForWord, {base: true, stem: true})
      .subscribe((entry: DictEntry) => {
        if (entry == null) {
          this.removeTagIfDummy(element);
          return;
        }
        let dr = new DictRequest();
        dr.wordElement = element;
        dr.dictEntry = entry;
        dr.meaningItemId = oriMid;
        dr.relatedWords = null;
        dr.meaningItemCallback = meaningItemCallback;
        if (oriForWord !== word) {
          dr.relatedWords = [word];
        }
        let phrase = this.currentPhrase(element);
        if (phrase && phrase !== word && phrase !== oriForWord) {
          if (dr.relatedWords === null) {
            dr.relatedWords = [phrase];
          } else {
            dr.relatedWords.push(phrase);
          }
        }
        this.dictRequest.emit(dr);
      });
  }

  addANote() {
    let ar: AnnotateResult = this.annotator.annotate();
    if (!ar || !ar.wordEl) {
      return;
    }
    let dataName = this.annotation.dataName;//note
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
        this.onContentChange();
        if (this.annotatedWordsHoverSetup) {
          this.showAnnotationsHover(element);
        }
      }
    };

    let nr = new NoteRequest();
    nr.wordElement = element;
    nr.note = oriNote || '';
    nr.editNoteCallback = editNoteCallback;
    this.noteRequest.emit(nr)
  }

  private doAnnotate() {
    if (this.annotation.nameEn === 'SelectWordMeaning') {
      this.selectWordMeaning();
    } else if (this.annotation.nameEn === 'AddANote') {
      this.addANote();
    } else {
      let ar: AnnotateResult = this.annotator.annotate();
      if (!ar) {
        return;
      }
      if (ar.wordEl) {
        if (ar.elCreated) {
          if (ar.wordEl.matches(ParaContentComponent.highlightWordsSelector)) {
            this.highlightAssociatedWords(ar.wordEl);
          }
          if (this.annotatedWordsHoverSetup) {
            this.showAnnotationsHover(ar.wordEl);
          }
        }
        if (ar.operation === 'remove') {
          let {changed, removed} = this.removeTagIfDummy(ar.wordEl);
          if (removed) {
            this.destroyAnnotatedWordsPopup(ar.wordEl);
          }
        }
        this.onContentChange();
      }
    }
  }

  onMouseup($event) {
    if (!this.gotFocus || !this.annotating || !this.annotation) {
      return;
    }
    $event.stopPropagation();
    this.doAnnotate();
  }

  onKeyup($event) {
    $event.stopPropagation();
    if (!this.editable) {
      return;
    }
    this.onContentChange();
  }

  private onContentChange() {
    if (this.contentChanged) {
      return;
    }
    this.beenChanged = true;
    this.contentChanged = true;
    this.contentChange.emit(this.getLiveContent.bind(this));
  }

  onTransKeyup($event) {
    $event.stopPropagation();
    if (!this.editable) {
      return;
    }
    if (this.transChanged) {
      return;
    }
    this.beenChanged = true;
    this.transChanged = true;
    this.contentChange.emit(this.getLiveContent.bind(this));
  }

  private parseHtml(paraTextEl, side) {
    paraTextEl = paraTextEl.cloneNode(true);

    if (side === 'content') {
      let dcp = ParaContentComponent.dropClassPrefix;
      let tcp = ParaContentComponent.tetherClassPrefix;
      let dropEls = paraTextEl.querySelectorAll(`.${dcp}target, .${tcp}target`);
      for (let el of dropEls) {
        el.className = el.className.split(' ')
          .filter(n => !n.startsWith(dcp) && !n.startsWith(tcp)).join(' ');
        this.removeTagIfDummy(el);
      }
    }
    let hlEls = paraTextEl.querySelectorAll('.' + ParaContentComponent.highlightClass);
    for (let hlEl of hlEls) {
      hlEl.classList.remove(ParaContentComponent.highlightClass);
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
      contents.content = this.parseHtml(contentEl, 'content');
      this.contentChanged = false;
    }
    if (this.transChanged) {
      let transEl = this.paraTrans.element.nativeElement;
      contents.trans = this.parseHtml(transEl, 'trans');
      this.transChanged = false;
    }

    return contents;
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
      hl.classList.remove(ParaContentComponent.highlightClass);
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
      hl.classList.remove(ParaContentComponent.highlightClass);
    }
    this.highlightedWords = null;
  }

  private setupSentenceHover() {

    if (this.sentenceHoverSetup || !this.highlightSentence || !this.gotFocus) {
      return;
    }

    let contentEl = this.contentText.element.nativeElement;
    let transEl = this.paraTrans.element.nativeElement;
    let contentMap = new Map<string, Element>();
    let transMap = new Map<string, Element>();
    for (let [textEl, selMap] of [[contentEl, contentMap], [transEl, transMap]]) {
      let sentenceEls = textEl.querySelectorAll(ParaContentComponent.sentenceTagName);
      for (let stEl of sentenceEls) {
        if (!stEl.dataset) {
          continue;
        }
        let sid = stEl.dataset.sid;
        if (sid) {
          selMap.set(sid, stEl);
        }
      }
    }

    let component = this;

    let sentenceMouseover = function (event) {
      if (!component.highlightSentence || !component.gotFocus) {
        return;
      }
      let el = this;
      if (!el.dataset) {
        return;
      }
      let sid = el.dataset.sid;
      if (!sid) {
        return;
      }

      component.clearSentenceHighlights();
      for (let selMap of [contentMap, transMap]) {
        let tsEl = selMap.get(sid);
        if (tsEl) {
          tsEl.classList.add(ParaContentComponent.highlightClass);
          if (!component.highlightedSentences) {
            component.highlightedSentences = [];
          }
          component.highlightedSentences.push(tsEl);
        }
      }
    };

    for (let textEl of [contentEl, transEl]) {
      let sentenceEls = textEl.querySelectorAll(ParaContentComponent.sentenceTagName);
      for (let sentenceEl of sentenceEls) {
        sentenceEl.addEventListener('mouseover', sentenceMouseover);
      }
    }

    this.sentenceHoverSetup = true;
  }

  private findSentence(node): any {
    let contentTextEl = this.contentText.element.nativeElement;
    let sentenceSelector = ParaContentComponent.sentenceTagName;
    do {
      if (node instanceof Element) {
        let el = node as Element;
        if (el === contentTextEl) {
          return null;
        }
        if (el.matches(sentenceSelector)) {
          return el;
        }
      }
      node = node.parentNode;
    } while (node);
    return null;
  }

  private highlightAssociatedWords(wordEl) {

    let component = this;

    let wordsMouseleave = function (event) {
      component.clearWordHighlights();
    };

    let wordsMouseover = function (event) {
      component.clearWordHighlights();

      let el = this;
      let stEl = component.findSentence(el);
      if (!stEl) {
        stEl = component.contentText.element.nativeElement;
      }

      let groupSelector = HighlightGroups.matchGroup(el);
      if (!groupSelector) {
        return;
      }
      let annEls = stEl.querySelectorAll(groupSelector);
      for (let annEl of annEls) {
        annEl.classList.add(ParaContentComponent.highlightClass);
        if (!component.highlightedWords) {
          component.highlightedWords = [];
        }
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

    let contentEl = this.contentText.element.nativeElement;
    let annEls = contentEl.querySelectorAll(ParaContentComponent.highlightWordsSelector);
    for (let annEl of annEls) {
      this.highlightAssociatedWords(annEl);
    }

    this.associatedWordsHoverSetup = true;
  }


  private showAnnotationsHover(wordEl) {
    if (this.wordsPopupMap.has(wordEl)) {
      return;
    }

    if (!this.wordAnnosComponentRef) {
      let factory: ComponentFactory<WordAnnosComponent> = this.resolver.resolveComponentFactory(WordAnnosComponent);
      this.wordAnnos.clear();
      this.wordAnnosComponentRef = this.wordAnnos.createComponent(factory);
    }
    let wacr = this.wordAnnosComponentRef;
    wacr.instance.paraTextEl = this.contentText.element.nativeElement;
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
      classes: `${ParaContentComponent.dropClassPrefix}anno`,
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
    let annEls = contentEl.querySelectorAll(Annotator.annotationTagName);
    for (let annEl of annEls) {
      this.showAnnotationsHover(annEl);
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
    this.paraTrans.element.nativeElement.innerHTML = html;
    this.transRendered = true;
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
        let annotator = this.annotator;
        let wacins = annotator.wordAtCursorIfNoSelection;
        annotator.wordAtCursorIfNoSelection = false;
        this.doAnnotate();
        annotator.wordAtCursorIfNoSelection = wacins;
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

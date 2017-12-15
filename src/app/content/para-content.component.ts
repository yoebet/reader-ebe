import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef, ChangeDetectorRef
} from '@angular/core';

import {SelectionAnnotator} from './selection-annotator';
import {Annotations} from './annotations';

import {DictEntry} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {ParaLiveContent} from '../view-common/para-live-content';
import {DictRequest} from '../view-common/dict-request';
import {NoteRequest} from '../view-common/note-request';
import {Annotation} from '../view-common/annotation';

@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html',
  styleUrls: ['./para-content.component.css']
})
export class ParaContentComponent implements OnChanges {
  @ViewChild('paraText', {read: ViewContainerRef}) paraText: ViewContainerRef;
  @ViewChild('paraTrans', {read: ViewContainerRef}) paraTrans: ViewContainerRef;
  @Input() content: string;
  @Input() trans: string;
  @Input() showTrans: boolean;
  @Input() gotFocus: boolean;
  @Input() editable: boolean;
  @Input() annotating: boolean;
  @Input() annotation: Annotation;
  @Output() contentChange = new EventEmitter<ParaLiveContent>();
  @Output() contentCommand = new EventEmitter<string>();
  @Output() dictRequest = new EventEmitter<DictRequest>();
  @Output() noteRequest = new EventEmitter<NoteRequest>();
  _annotator: SelectionAnnotator;
  beenChanged = false;
  contentChanged = false;
  transChanged = false;
  transRendered = false;
  hover = true;
  hoverSetup = false;
  highlightedSentences: Element[] = [];
  highlightedWords: Element[] = [];

  constructor(private dictService: DictService, private cdr: ChangeDetectorRef) {
  }

  get annotator() {
    if (!this._annotator) {
      let contentEl = this.paraText.element.nativeElement;
      this._annotator = new SelectionAnnotator(contentEl);
      this._annotator.selectionBreakerSelector = 's-st';
    }
    this._annotator.switchAnnotation(this.annotation);
    return this._annotator;
  }

  private removeTagIfDummy(el) {
    if (el.tagName !== 'SPAN') {
      return false;
    }
    let changed = false;
    if (el.className === '') {
      el.removeAttribute('class');
      changed = true;
    }
    if (!el.hasAttributes()) {
      //remove tag
      let pp = el.parentNode;
      if (!pp) {
        return changed;
      }
      while (el.firstChild) {
        pp.insertBefore(el.firstChild, el);
      }
      pp.removeChild(el);
      pp.normalize();
      changed = true;
    }
    return changed;
  };

  selectWordMeaning() {
    let wordTag = this.annotator.getOrCreateWordTag();
    if (!wordTag) {
      return;
    }
    let {element, word, created} = wordTag;
    let oriMid = null;
    if (element.dataset.mid) {
      let mid = parseInt(element.dataset.mid);
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
        let changed = this.removeTagIfDummy(element);
        if (changed) {
          // this.onContentChange();
        }
      } else {
        if (mid === -1) {
          //unset
          element.removeAttribute('data-mid');
          if (element.dataset.word) {
            element.removeAttribute('data-word');
          }
          this.removeTagIfDummy(element);
        } else {
          element.dataset.mid = '' + mid;
          if (forWord !== oriForWord) {
            element.dataset.word = forWord;
          }
        }
        this.onContentChange();
      }
    };

    this.dictService.getEntry(oriForWord, {base: true, stem: true})
      .subscribe((entry: DictEntry) => {
        if (entry == null) {
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
        this.dictRequest.emit(dr);
      });
  }

  addANote() {
    let wordTag = this.annotator.getOrCreateWordTag(3, 1);
    if (!wordTag) {
      return;
    }
    let {element, word, created} = wordTag;
    let oriNote = element.dataset.note;

    let editNoteCallback = (note: string) => {
      let changed = false;
      if (note === null || note === oriNote) {
        // cancel
        /*changed = */
        this.removeTagIfDummy(element);
      } else {
        if (note === '') {
          if (typeof oriNote !== 'undefined') {
            element.removeAttribute('data-note');
            this.removeTagIfDummy(element);
            this.onContentChange();
            changed = true;
          }
        } else {
          element.dataset.note = note;
          this.onContentChange();
          changed = true;
        }
      }
      if (changed) {
        this.onContentChange();
      }
    };

    let nr = new NoteRequest();
    nr.wordElement = element;
    nr.note = oriNote || '';
    nr.editNoteCallback = editNoteCallback;
    this.noteRequest.emit(nr)
  }

  onMouseup($event) {
    if (!this.gotFocus || !this.annotating || !this.annotation) {
      return;
    }

    $event.stopPropagation();

    if (this.annotation.name === 'SelectWordMeaning') {
      this.selectWordMeaning();
    } else if (this.annotation.name === 'AddANote') {
      this.addANote();
    } else {
      let altered = this.annotator.annotate();
      if (altered) {
        this.onContentChange();
      }
    }
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

  private parseHtml(contentEl) {
    contentEl = contentEl.cloneNode(true);
    let contents = [];
    //:scope > .part
    let textEls = contentEl.querySelectorAll('.para-text > .part');
    if (textEls.length === 0) {
      textEls = [contentEl];
    }
    for (let textEl of textEls) {
      //ofui: Only For UI
      let toStripElements = textEl.querySelectorAll('.ofui, br');
      for (let toStrip of toStripElements) {
        let pn = toStrip.parentNode;
        if (pn) {
          pn.removeChild(toStrip);
        }
      }
      contents.push(textEl.innerHTML);
    }
    return contents.join('\n');
  }

  getLiveContent() {

    let contents: any = {};

    if (this.contentChanged) {
      let contentEl = this.paraText.element.nativeElement;
      contents.content = this.parseHtml(contentEl);
      this.contentChanged = false;
    }
    if (this.transChanged) {
      let transEl = this.paraTrans.element.nativeElement;
      contents.trans = this.parseHtml(transEl);
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

  private clearHighlighted() {

    let hls = this.highlightedSentences;
    while (hls.length > 0) {
      let hl = hls.pop();
      hl.classList.remove('highlight');
    }
  }

  private setupSentenceHover() {

    let sentenceTagName = 's-st';

    let contentEl = this.paraText.element.nativeElement;
    let transEl = this.paraTrans.element.nativeElement;
    let contentMap = new Map<string, Element>();
    let transMap = new Map<string, Element>();
    for (let [textEl, selMap] of [[contentEl, contentMap], [transEl, transMap]]) {
      let sentenceEls = textEl.querySelectorAll(sentenceTagName);
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
      if (!component.gotFocus) {
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

      component.clearHighlighted();
      // console.log(sid);
      for (let selMap of [contentMap, transMap]) {
        let tsEl = selMap.get(sid);
        if (tsEl) {
          tsEl.classList.add('highlight');
          component.highlightedSentences.push(tsEl);
        }
      }
    };

    for (let textEl of [contentEl, transEl]) {
      let sentenceEls = textEl.querySelectorAll(sentenceTagName);
      for (let sentenceEl of sentenceEls) {
        sentenceEl.addEventListener('mouseover', sentenceMouseover);
      }
    }
  }

  private setupMouseoverIfNeeded() {

    if (!this.gotFocus || !this.hover || this.hoverSetup) {
      return;
    }
    this.setupSentenceHover();

    this.hoverSetup = true;
  }

  refreshContent() {
    let html = this.content || ' ';
    // html = html.replace(
    //   /\n/g,
    //   () =>
    //     ` <i class="caret up icon linefeed ofui"></i>\n`
    // );
    html = `<div class="part">${html}</div>`;
    this.paraText.element.nativeElement.innerHTML = html;

    this.hoverSetup = false;
    this.setupMouseoverIfNeeded();
  }

  refreshTrans() {
    let html = this.trans || ' ';
    html = `<div class="part">${html}</div>`;
    this.paraTrans.element.nativeElement.innerHTML = html;
    this.transRendered = true;

    this.hoverSetup = false;
    this.setupMouseoverIfNeeded();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.gotFocus) {
      if (this.gotFocus) {
        this.setupMouseoverIfNeeded();
      } else {
        this.clearHighlighted();
      }
    }
    if (changes.trans) {
      this.transRendered = false;
      this.hoverSetup = false;
    }
    if (this.showTrans && !this.transRendered) {
      this.refreshTrans();
    }
    if (changes.content) {
      this.refreshContent();
      return;
    }
    if (changes.annotation) {
      let contentChanged = this.annotator.annotate(false);
      if (contentChanged) {
        this.onContentChange();
      }
    }
    // if (changes.gotFocus) {
    //   if (this.gotFocus) {
    //     this.cdr.reattach();
    //   } else {
    //     setTimeout(() => {
    //       this.cdr.detach();
    //     }, 0);
    //   }
    // }
  }
}

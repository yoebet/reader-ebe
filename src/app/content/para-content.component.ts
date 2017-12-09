import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef, ChangeDetectorRef
} from '@angular/core';

import {ParaLiveContent} from '../models/para';
import {SelectionAnnotator} from './selection-annotator';
import {Annotations} from './annotations';

import {DictEntry} from '../models/dict-entry';
import {DictService} from '../services/dict.service';

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
  @Input() annotation: string;
  @Output() contentChange = new EventEmitter<ParaLiveContent>();
  @Output() contentCommand = new EventEmitter<string>();
  @Output() dictRequest = new EventEmitter<{ wordElement, dictEntry, meaningItemId, relatedWords?, meaningItemCallback }>();
  @Output() noteRequest = new EventEmitter<{ wordElement, note, editNoteCallback }>();
  _annotator: SelectionAnnotator;
  beenChanged = false;
  contentChanged = false;
  transChanged = false;
  transRendered = false;

  constructor(private dictService: DictService, private cdr: ChangeDetectorRef) {
  }

  get annotator() {
    if (!this._annotator) {
      let contentEl = this.paraText.element.nativeElement;
      this._annotator = new SelectionAnnotator(Annotations.forAnnotator, contentEl);
      this._annotator.selectionBreakerSelector = '.linefeed';
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
        let dr = {
          wordElement: element,
          dictEntry: entry,
          meaningItemId: oriMid,
          relatedWords: null,
          meaningItemCallback
        };
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

    let editNoteCallback = (note) => {
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

    let nr = {wordElement: element, note: oriNote || '', editNoteCallback};
    this.noteRequest.emit(nr)
  }

  onMouseup($event) {
    if (!this.gotFocus || !this.annotating) {
      return;
    }

    $event.stopPropagation();

    if (this.annotation === 'SelectWordMeaning') {
      this.selectWordMeaning();
    } else if (this.annotation === 'AddANote') {
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

  refreshContent() {
    let html = this.content || ' ';
    // html = html.replace(
    //   /\n/g,
    //   () =>
    //     ` <i class="caret up icon linefeed ofui"></i>\n`
    // );
    html = `<div class="part">${html}</div>`;
    this.paraText.element.nativeElement.innerHTML = html;
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

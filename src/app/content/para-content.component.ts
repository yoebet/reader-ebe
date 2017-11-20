import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef
} from '@angular/core';

import {ParaLiveContent} from '../models/para-live-content';
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
  @Output() dictRequest = new EventEmitter<{ wordElement, dictEntry }>();
  _annotator: SelectionAnnotator;
  beenChanged = false;
  contentChanged = false;
  transChanged = false;
  transRendered = false;

  constructor(private dictService: DictService) {
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

  selectWordMeaning() {
    let wordTag = this.annotator.getOrCreateWordTag();
    if (!wordTag) {
      return;
    }
    console.log(wordTag);
    let {element, word, created} = wordTag;

    this.dictService.getEntry(word).subscribe((entry: DictEntry) => {
      if (entry) {
        //selectCallback
        //cancelCallback
        let dr = {wordElement: element, dictEntry: entry};
        this.dictRequest.emit(dr);
      }
    });

  }

  onMouseup($event) {
    $event.stopPropagation();
    if (!this.gotFocus) {
      return;
    }
    this.selectWordMeaning();

    if (!this.annotating) {
      return;
    }
    let altered = this.annotator.annotate();
    if (altered) {
      this.onContentChange();
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
  }
}

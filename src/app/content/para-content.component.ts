import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef
} from '@angular/core';

import {SelectionAnnotator} from './selection-annotator';
import {Annotations} from './annotations';

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
  @Output() contentChange = new EventEmitter();
  @Output() contentCommand = new EventEmitter();
  _annotator: SelectionAnnotator;
  beenChanged = false;
  changed = false;
  transChanged = false;
  transRendered = false;

  get annotator() {
    if (!this._annotator) {
      let contentEl = this.paraText.element.nativeElement;
      this._annotator = new SelectionAnnotator(Annotations.forAnnotator, contentEl);
      this._annotator.selectionBreakerSelector = '.linefeed';
    }
    this._annotator.switchAnnotation(this.annotation);
    return this._annotator;
  }

  onMouseup() {
    if (!this.gotFocus) {
      return;
    }
    if (!this.annotating) {
      return;
    }
    // let annos = this.annotator.getAnnotationsAtCursor();
    // console.log(annos);
    let altered = this.annotator.annotate();
    if (altered) {
      this.onContentChange();
    }
  }

  onKeyup() {
    if (!this.editable) {
      return;
    }
    this.onContentChange();
  }

  onTransKeyup() {
    if (!this.editable) {
      return;
    }
    this.transChanged = true;
    this.beenChanged = true;
    this.contentChange.emit(this.getLiveContent.bind(this));
  }

  private onContentChange() {
    this.beenChanged = true;
    this.changed = true;
    this.contentChange.emit(this.getLiveContent.bind(this));
  }

  private parseHtml(contentEl) {
    contentEl = contentEl.cloneNode(true);
    let contents = [];
    //:scope > .part
    let textEls = contentEl.querySelectorAll('.para-text > .part');
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

    if (this.changed) {
      let contentEl = this.paraText.element.nativeElement;
      let content = this.parseHtml(contentEl);
      contents.content = content;
      this.changed = false;
    }
    if (this.transChanged) {
      let transEl = this.paraTrans.element.nativeElement;
      let trans = this.parseHtml(transEl);
      contents.trans = trans;
      this.transChanged = false;
    }

    return contents;
  }

  notifySave() {
    this.contentCommand.emit('save');
  }

  discard() {
    this.contentCommand.emit('discard');
    if (this.changed) {
      this.changed = false;
      this.refresh();
    }
    if (this.transChanged) {
      this.transChanged = false;
      this.refreshTrans();
    }
  }

  refresh() {
    let html = this.content;
    // html = html.replace(
    //   /\n/g,
    //   () =>
    //     ` <i class="caret up icon linefeed ofui"></i>\n`
    // );
    html = `<div class="part">${html}</div>`;
    this.paraText.element.nativeElement.innerHTML = html;
  }

  refreshTrans() {
    let html = this.trans || '';
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
      this.refresh();
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

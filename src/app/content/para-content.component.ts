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
  @Input() content: string;
  @Input() gotFocus;
  @Input() editable = true;
  @Input() annotating = true;
  @Input() annotation: string = null;
  @Output() contentChange = new EventEmitter();
  @Output() contentCommand = new EventEmitter();
  _annotator: SelectionAnnotator;
  beenChanged = false;
  changed = false;

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

  private onContentChange() {
    this.beenChanged = true;
    this.changed = true;
    this.contentChange.emit(this.getLiveContent.bind(this));
  }

  getLiveContent(): string {

    let contentEl = this.paraText.element.nativeElement;
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
    let content = contents.join('\n');

    this.changed = false;
    return content;
  }

  notifySave() {
    this.contentCommand.emit('save');
  }

  discard() {
    this.contentCommand.emit('discard');
    this.changed = false;
    this.refresh();
  }

  refresh() {
    let html = this.content;
    // html = html.replace(
    //   /\n/g,
    //   () =>
    //     ` <i class="caret up icon linefeed ofui"></i>\n`
    // );
    html = `<div class="part">${html}</div>`;
    //this.paraText.clear();
    this.paraText.element.nativeElement.innerHTML = html;
  }

  ngOnChanges(changes: SimpleChanges) {
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

import {
  OnChanges, Input, Output, EventEmitter, SimpleChanges,
  Component, ViewChild, ViewContainerRef
} from '@angular/core';

import {SelectionAnnotator} from './selection-annotator';
import {Annotations} from './annatations';

const ContentWrapperClass = 'pre-wrap';

@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html'
})
export class ParaContentComponent implements OnChanges {
  @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
  @Input() content: string;
  @Input() gotFocus;
  @Input() annotation: string = null;
  @Output() contentChange = new EventEmitter();
  @Output() contentCommand = new EventEmitter();
  _annotator: SelectionAnnotator;
  beenChanged = false;
  changed = false;

  get annotator() {
    if (!this._annotator) {
      let container = '.' + ContentWrapperClass;
      this._annotator = new SelectionAnnotator(Annotations.forAnnotator, container);
      this._annotator.selectionBreakerSelector = '.line-break';
    }
    this._annotator.switchAnnotation(this.annotation);
    return this._annotator;
  }

  onMouseup() {
    if (!this.gotFocus) {
      return;
    }
    let contentChanged = this.annotator.annotate();
    if (contentChanged) {
      this.onContentChange();
    }
  }

  private onContentChange() {
    this.beenChanged = true;
    this.changed = true;
    this.contentChange.emit(this.getLiveContent.bind(this));
  }

  getLiveContent(): string {

    let vcEl = this.vc.element.nativeElement;
    let contentEl = vcEl.querySelector('.' + ContentWrapperClass);
    contentEl = contentEl.cloneNode(true);
    let toStripElements = contentEl.querySelectorAll('i.icon');
    for (let toStrip of toStripElements) {
      let pn = toStrip.parentNode();
      if (pn) {
        pn.removeChild(toStrip);
      }
    }
    let content = contentEl.innerHTML;

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
    html = html.replace(
      /\n/g,
      () =>
        ' <i class="caret up icon line-break"></i>\n'
    );
    html = `<div class="${ContentWrapperClass}">${html}</div>`;
    this.vc.clear();
    this.vc.element.nativeElement.innerHTML = html;
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

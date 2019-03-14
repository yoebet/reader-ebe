import {Component, Input, OnInit} from '@angular/core';

import {DictService} from '../services/dict.service';
import {AnnotationSet} from "../anno/annotation-set";
import {UIConstants, DataAttrNames, DataAttrValues} from '../config';

@Component({
  selector: 'word-annos',
  templateUrl: './word-annos.component.html',
  styleUrls: ['./word-annos.component.css']
})
export class WordAnnosComponent implements OnInit {
  @Input() _wordEl: HTMLElement;
  @Input() paraTextEl: HTMLElement;
  @Input() enabled: boolean;
  @Input() annotationSet: AnnotationSet;
  word: string;
  head: string;
  items: any[];
  note: string;
  meaning: any;
  private initialized = false;


  ngOnInit() {
    this.initialized = true;
  }

  set wordEl(_wordEl: HTMLElement) {
    this._wordEl = _wordEl;
    if (this.initialized && this.enabled) {
      this.parseAnnotations();
    }
  }

  get wordEl(): HTMLElement {
    return this._wordEl;
  }

  private parseAnnotations() {
    this.items = [];
    this.note = null;
    this.meaning = null;
    let wordEl = this._wordEl;
    if (!wordEl) {
      this.word = null;
      this.head = null;
      return;
    }
    this.word = wordEl.textContent;
    this.head = this.word;
    let phraseGroup = null;

    let dataset = wordEl.dataset;
    for (let name in dataset) {
      let value = dataset[name];
      if (name === DataAttrNames.mid) {
        let mid = parseInt(value);
        if (isNaN(mid)) {
          continue;
        }
        let forWord = wordEl.dataset[DataAttrNames.word];
        if (!forWord) {
          forWord = this.word;
        }
        let mean = wordEl.dataset[DataAttrNames.mean];
        this.meaning = {mid, word: forWord, text: mean || ''};
        continue;
      }
      if (name === DataAttrNames.note) {
        this.note = value;
        continue;
      }
      if (name === DataAttrNames.assoc && DataAttrValues.phraPattern.test(value)) {
        phraseGroup = value;
        continue;
      }
      let text = this.annotationSet.annotationOutput(name, value);
      if (!text) {
        continue;
      }
      let item = {dataName: name, dataValue: value, text};
      this.items.push(item);
    }

    if (phraseGroup && this.items.length === 0 && !this.note && !this.meaning) {
      let stEl = this.findSentence(this.wordEl);
      if (!stEl) {
        stEl = this.paraTextEl;
      }
      let groupSelector = `[data-${DataAttrNames.assoc}=${phraseGroup}]`;
      let groupEls = stEl.querySelectorAll(groupSelector);
      let els = Array.from(groupEls);
      this.head = els.map((el: Element) => el.textContent).join(' ');
    }
    if (this.head.length > 20) {
      this.head = this.head.substring(0, 20) + '...';
    }
  }

  private findSentence(node): any {
    do {
      if (node instanceof Element) {
        let el = node as Element;
        if (el === this.paraTextEl) {
          return null;
        }
        if (el.matches(UIConstants.sentenceTagName)) {
          return el;
        }
      }
      node = node.parentNode;
    } while (node);
    return null;
  }

}
